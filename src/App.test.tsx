// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import {
  act,
  cleanup,
  createEvent,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComponentProps } from 'react'
import type { DragEndEvent } from '@dnd-kit/core'
import type {
  BackgroundTaskSnapshot,
  ComputerSummary,
  KnowledgeRoot,
  ManagedSession,
  SessionKnowledgeBinding,
  ManagedSessionMcpServersSnapshot,
  ManagedSessionSkillsSnapshot,
  WorkspaceFile,
  WorkspaceListing,
} from '../shared/contracts'
import App from './App'
import { SubmissionError } from '../shared/submission-error'
import {
  applySettingsChanges,
  applySettingsImport,
  validateSettingsChanges,
  validateSettingsImport,
  type SettingsProfileRecord,
  type SettingsProfileSnapshot,
  type SettingsProfileValues,
} from '../shared/settings-profile'
import {
  getManager,
  sendManagerMessage,
  activateSession,
  cancelBackgroundTask,
  askSession,
  cancelSession,
  clearConversation,
  recoverConversation,
  createSession,
  configureRuntime,
  configureRetention,
  deleteSession,
  dispatchQueuedPrompt,
  executeCommand,
  getPushSettings,
  getProviderRuntimeOptions,
  getSession,
  getSessionKnowledgeRoot,
  updateSessionKnowledgeRoot,
  SessionKnowledgeRequestError,
  getRuntimeOptions,
  listBackgroundTasks,
  listCommands,
  listComputers,
  fetchSessionOrder,
  saveSessionVisibility,
  saveSessionOrderLane,
  bootstrapSessionOrder,
  fetchSettingsProfile,
  saveSettingsChanges,
  importSettingsProfile,
  listDirectories,
  listHistory,
  listKnowledgeRoots,
  listKnowledgeEntries,
  readKnowledgeFile,
  addKnowledgeRoot,
  deleteKnowledgeRoot,
  listSessions,
  listSessionSkills,
  listSessionMcpServers,
  listSessionListing,
  listWorkspace,
  validateSessionDirectory,
  moveSessionToTmux,
  removeQueuedPrompt,
  reorderQueuedPrompts,
  updateQueuedPrompt,
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
import * as shell from './shell'

type DndProps = ComponentProps<typeof import('@dnd-kit/core').DndContext>
const dragHandlers = vi.hoisted(() =>
  new Map<string, NonNullable<DndProps['onDragEnd']>>(),
)
/** The hub's settings profile the api mocks read and commit with the real rules. */
let hubSettings: SettingsProfileRecord = { revision: 0, values: {}, keyRevisions: {} }
const hubSettingsId = 'test-profile'

function hubSettingsSnapshot(): SettingsProfileSnapshot {
  return {
    profileId: hubSettingsId,
    revision: hubSettings.revision,
    values: structuredClone(hubSettings.values),
  }
}

/** Seeds the hub as if another device had already chosen these. */
function seedHubSettings(values: SettingsProfileValues) {
  hubSettings = applySettingsImport(
    hubSettings,
    validateSettingsImport(values as Record<string, unknown>),
  )
}

/** What this device shows for a setting: its unsent edit, else what it last saw. */
function savedSetting<K extends keyof SettingsProfileValues>(key: K): SettingsProfileValues[K] {
  const cache = JSON.parse(localStorage.getItem('agentic-remote:settings-profile') || 'null')
  if (cache?.pending?.[key]) return cache.pending[key].value ?? undefined
  return cache?.values?.[key] ?? cache?.imports?.[key]
}

/** The hub-owned custom session order the api mocks read and commit against. */
let hubSessionOrder: {
  revision: number
  bootstrapped: boolean
  showSuspended: boolean
  order: Record<string, string[]>
} = { revision: 0, bootstrapped: false, showSuspended: true, order: {} }

vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@dnd-kit/core')>()
  return {
    ...actual,
    DndContext(props: DndProps) {
      if (props.onDragEnd) {
        dragHandlers.set(props.id || 'session-navigation', props.onDragEnd)
      }
      return <actual.DndContext {...props} />
    },
  }
})


function finishReorder(context: string, from: string, to: string) {
  const handler = dragHandlers.get(context)
  if (!handler) throw new Error(`The ${context} drag handler is not mounted`)
  const event: DragEndEvent = {
    activatorEvent: new Event('pointerup'),
    active: {
      id: from,
      data: { current: {} },
      rect: { current: { initial: null, translated: null } },
    },
    over: {
      id: to,
      data: { current: {} },
      rect: new DOMRect(0, 0, 10, 10),
      disabled: false,
    },
    collisions: [],
    delta: { x: 0, y: 0 },
  }
  handler(event)
}

function finishQueueReorder(from: string, to: string) {
  finishReorder('prompt-queue', `queued:${from}`, `queued:${to}`)
}

vi.mock('./api', async (importOriginal) => ({
  SessionKnowledgeRequestError: (await importOriginal<typeof import('./api')>()).SessionKnowledgeRequestError,
  getManager: vi.fn(),
  sendManagerMessage: vi.fn(),
  retryManagerMessage: vi.fn(),
  resolveManagerConfirmation: vi.fn(),
  removeQueuedManagerMessage: vi.fn(),
  updateManagerSettings: vi.fn(),
  cancelManager: vi.fn(),
  resetManager: vi.fn(),
  listSessions: vi.fn(),
  listSessionListing: vi.fn(),
  fetchSessionOrder: vi.fn(),
  saveSessionVisibility: vi.fn(),
  saveSessionOrderLane: vi.fn(),
  bootstrapSessionOrder: vi.fn(),
  fetchSettingsProfile: vi.fn(),
  saveSettingsChanges: vi.fn(),
  importSettingsProfile: vi.fn(),
  listBackgroundTasks: vi.fn(),
  renameSession: vi.fn(),
  removeQueuedPrompt: vi.fn(),
  reorderQueuedPrompts: vi.fn(),
  updateQueuedPrompt: vi.fn(),
  dispatchQueuedPrompt: vi.fn(),
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
  getSessionKnowledgeRoot: vi.fn(),
  updateSessionKnowledgeRoot: vi.fn(),
  listCommands: vi.fn(),
  listSessionSkills: vi.fn(),
  listSessionMcpServers: vi.fn(),
  addComputer: vi.fn(),
  removeComputer: vi.fn(),
  createSession: vi.fn(),
  configureRuntime: vi.fn(),
  getRuntimeOptions: vi.fn(),
  getProviderRuntimeOptions: vi.fn(),
  clearConversation: vi.fn(),
  recoverConversation: vi.fn(),
  restartSession: vi.fn(),
  resumeSession: vi.fn(),
  suspendSession: vi.fn(),
  configureRetention: vi.fn(),
  activateSession: vi.fn(),
  sendMessage: vi.fn(),
  executeCommand: vi.fn(),
  getPushSettings: vi.fn(),
  cancelSession: vi.fn(),
  askSession: vi.fn(),
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
  readyState = 1
  send = vi.fn()
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
      supportsContextRecovery: true,
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

const knowledgeRoot = {
  id: 'root-1',
  computerId: computer.id,
  computerName: computer.name,
  path: '/home/tester/docs',
  name: 'docs',
  createdAt: '2026-08-01T00:00:00.000Z',
}

let fixtureKnowledgeRoots: KnowledgeRoot[] = []
const fixtureKnowledgeBindings = new Map<string, SessionKnowledgeBinding>()

function mockKnowledgeRoots(roots: KnowledgeRoot[]) {
  fixtureKnowledgeRoots = structuredClone(roots)
  vi.mocked(listKnowledgeRoots).mockImplementation(async () => structuredClone(fixtureKnowledgeRoots))
}

function mockAddedKnowledgeRoot(root: KnowledgeRoot) {
  vi.mocked(addKnowledgeRoot).mockImplementation(async () => {
    fixtureKnowledgeRoots = [
      ...fixtureKnowledgeRoots.filter((candidate) => candidate.id !== root.id),
      structuredClone(root),
    ]
    return structuredClone(root)
  })
}

async function chooseKnowledgeRoot(id: string) {
  const root = fixtureKnowledgeRoots.find((candidate) => candidate.id === id)
  if (!root) throw new Error(`Unknown fixture root: ${id}`)
  const reopen = screen.getByRole('button', { name: 'Choose Knowledge root' })
  await waitFor(() => expect(reopen).toBeEnabled())
  fireEvent.click(reopen)
  const dialog = await screen.findByRole('dialog', { name: /Choose a (session root|Knowledge folder)/ })
  const choice = within(dialog).queryByRole('radio', {
    name: `${root.name} on ${root.computerName}: ${root.path}`,
  }) || within(dialog).getByRole('radio', { name: "Use this session's folder" })
  await waitFor(() => expect(choice).toBeEnabled())
  fireEvent.click(choice)
  const apply = within(dialog).getByRole('button', { name: /^(Use for this session|Open folder)$/ })
  await waitFor(() => expect(apply).toBeEnabled())
  fireEvent.click(apply)
  await waitFor(() => expect(dialog).not.toBeInTheDocument())
}

function fixtureKnowledgeBinding(computerId: string, sessionId: string): SessionKnowledgeBinding {
  const key = `${computerId}:${sessionId}`
  let saved = fixtureKnowledgeBindings.get(key)
  if (!saved) {
    // Older tests specify their initial reading context in browser storage.
    // Mirror that fixture configuration as an existing hub link; new tests
    // explicitly override this API to exercise unbound/legacy-only sessions.
    const positions = JSON.parse(localStorage.getItem('agentic-remote:knowledge-session-positions') || '{}') as
      Record<string, { rootId?: string }>
    const root = localStorage.getItem('agentic-remote:knowledge-position')
      ? undefined
      : fixtureKnowledgeRoots.find((candidate) => candidate.id === positions[key]?.rootId) ||
        fixtureKnowledgeRoots[0]
    saved = {
      computerId, sessionId, rootId: root?.id || null,
      rootPath: '.', revision: root ? 1 : 0, available: Boolean(root), root,
    }
    fixtureKnowledgeBindings.set(key, saved)
  }
  const root = fixtureKnowledgeRoots.find((candidate) => candidate.id === saved.rootId)
  return { ...saved, root: root || saved.root, available: Boolean(root) }
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

function openSessionActions() {
  const trigger = screen.getByRole('button', { name: 'Session actions' })
  if (trigger.getAttribute('aria-expanded') !== 'true') {
    fireEvent.click(trigger)
  }
}

function sessionAction(name: string) {
  openSessionActions()
  return within(
    screen.getByRole('group', { name: 'Session actions' }),
  ).getByRole('button', { name })
}

async function findSessionAction(name: string) {
  await screen.findByRole('button', { name: 'Session actions' })
  openSessionActions()
  return within(
    screen.getByRole('group', { name: 'Session actions' }),
  ).findByRole('button', { name })
}

describe('App', () => {
  it('initializes a chooser opened during lookup from the confirmed root, not a stale local default', async () => {
    const other = { ...knowledgeRoot, id: 'other-root', name: 'Other notes', path: '/srv/other' }
    mockKnowledgeRoots([knowledgeRoot, other])
    const key = `${computer.id}:${session.id}`
    localStorage.setItem('agentic-remote:knowledge-session-positions', JSON.stringify({
      [key]: { rootId: knowledgeRoot.id, path: '.' },
    }))
    let finishLookup!: (binding: SessionKnowledgeBinding) => void
    vi.mocked(getSessionKnowledgeRoot).mockReturnValueOnce(new Promise((resolve) => { finishLookup = resolve }))
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Choose Knowledge root' }))
    const chooser = await screen.findByRole('dialog', { name: 'Choose a session root' })
    const old = within(chooser).getByRole('radio', {
      name: `${knowledgeRoot.name} on ${knowledgeRoot.computerName}: ${knowledgeRoot.path}`,
    })
    expect(old).toBeDisabled()
    const confirmed: SessionKnowledgeBinding = {
      computerId: computer.id, sessionId: session.id, rootId: other.id,
      root: other, revision: 2, available: true,
    }
    fixtureKnowledgeBindings.set(key, confirmed)
    await act(async () => finishLookup(confirmed))
    expect(within(chooser).getByRole('radio', {
      name: `${other.name} on ${other.computerName}: ${other.path}`,
    })).toBeChecked()
    expect(old).not.toBeChecked()
    expect(within(chooser).getByRole('button', { name: 'Use for this session' })).toBeEnabled()
    expect(updateSessionKnowledgeRoot).not.toHaveBeenCalled()
  })

  it('leaves an unassigned session explicit and saves a root only after confirmation', async () => {
    mockKnowledgeRoots([knowledgeRoot])
    const key = `${computer.id}:${session.id}`
    fixtureKnowledgeBindings.set(key, {
      computerId: computer.id, sessionId: session.id, rootId: null, revision: 0, available: false,
    })
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    await screen.findByRole('heading', { name: 'Give this session a place to read' })
    expect(screen.queryByRole('tree')).toBeNull()
    expect(updateSessionKnowledgeRoot).not.toHaveBeenCalled()
    expect(addKnowledgeRoot).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Choose Knowledge root' }))
    const chooser = await screen.findByRole('dialog', { name: 'Choose a session root' })
    fireEvent.click(within(chooser).getByRole('button', { name: 'Cancel' }))
    expect(updateSessionKnowledgeRoot).not.toHaveBeenCalled()
    await chooseKnowledgeRoot(knowledgeRoot.id)
    await screen.findByText('Saved for this session')
    expect(updateSessionKnowledgeRoot).toHaveBeenCalledWith(computer.id, session.id, {
      rootId: knowledgeRoot.id, expectedRevision: 0,
    })
    expect(addKnowledgeRoot).not.toHaveBeenCalled()
    expect(executeCommand).not.toHaveBeenCalled()
    expect(sendMessage).not.toHaveBeenCalled()
    expect(fixtureKnowledgeBindings.get(key)?.rootId).toBe(knowledgeRoot.id)
  })

  it('roots a session at a nested folder without adding shared root options', async () => {
    mockKnowledgeRoots([knowledgeRoot])
    const key = `${computer.id}:${session.id}`
    fixtureKnowledgeBindings.set(key, {
      computerId: computer.id,
      sessionId: session.id,
      rootId: null,
      rootPath: '.',
      revision: 0,
      available: false,
    })
    vi.mocked(listDirectories).mockImplementation(async (_computerId, path) => {
      if (path === `${knowledgeRoot.path}/projects`) {
        return {
          path,
          parent: knowledgeRoot.path,
          directories: [{
            name: 'agentic-remote',
            path: `${path}/agentic-remote`,
          }],
        }
      }
      if (path === `${knowledgeRoot.path}/projects/agentic-remote`) {
        return {
          path,
          parent: `${knowledgeRoot.path}/projects`,
          directories: [],
        }
      }
      return {
        path: knowledgeRoot.path,
        directories: [{
          name: 'projects',
          path: `${knowledgeRoot.path}/projects`,
        }],
      }
    })
    vi.mocked(listKnowledgeEntries).mockImplementation(
      async (_rootId, path = '.') => ({
        path,
        entries: path === '.'
          ? [{
              name: 'README.md',
              path: 'README.md',
              kind: 'markdown',
              size: 20,
            }]
          : [],
      }),
    )
    vi.mocked(readKnowledgeFile).mockResolvedValue({
      name: 'README.md',
      path: 'README.md',
      kind: 'markdown',
      mimeType: 'text/markdown',
      size: 20,
      content: '# Scoped guide',
    })

    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    const choose = screen.getByRole('button', { name: 'Choose Knowledge root' })
    await waitFor(() => expect(choose).toBeEnabled())
    fireEvent.click(choose)
    const chooser = await screen.findByRole('dialog', {
      name: 'Choose a session root',
    })
    fireEvent.click(within(chooser).getByRole('radio', {
      name: `${knowledgeRoot.name} on ${knowledgeRoot.computerName}: ${knowledgeRoot.path}`,
    }))
    const optionCount = within(chooser).getAllByRole('radio').length
    fireEvent.click(await within(chooser).findByRole('button', { name: 'projects' }))
    fireEvent.click(await within(chooser).findByRole('button', {
      name: 'agentic-remote',
    }))

    expect(within(chooser).getAllByRole('radio')).toHaveLength(optionCount)
    expect(within(chooser).queryByRole('radio', {
      name: /agentic-remote/,
    })).not.toBeInTheDocument()
    fireEvent.click(within(chooser).getByRole('button', {
      name: 'Use for this session',
    }))

    await waitFor(() =>
      expect(updateSessionKnowledgeRoot).toHaveBeenCalledWith(
        computer.id,
        session.id,
        {
          rootId: knowledgeRoot.id,
          rootPath: 'projects/agentic-remote',
          expectedRevision: 0,
        },
      ),
    )
    await screen.findByText(`agentic-remote · ${knowledgeRoot.computerName}`)
    expect(listKnowledgeEntries).toHaveBeenCalledWith(
      knowledgeRoot.id,
      '.',
      'projects/agentic-remote',
    )
    fireEvent.click(await screen.findByRole('treeitem', { name: 'README.md' }))
    await screen.findByRole('heading', { name: 'Scoped guide' })
    fireEvent.click(screen.getByRole('button', {
      name: 'Ask agent about file',
    }))
    expect(screen.getByLabelText('Message')).toHaveValue(
      'Please review `/home/tester/docs/projects/agentic-remote/README.md` and help me with it.',
    )
    expect(
      JSON.parse(
        localStorage.getItem('agentic-remote:knowledge-session-positions') ||
          '{}',
      )[key],
    ).toMatchObject({
      rootId: knowledgeRoot.id,
      rootPath: 'projects/agentic-remote',
      path: '.',
    })

    fireEvent.click(screen.getByRole('button', { name: 'Choose Knowledge root' }))
    const reopened = await screen.findByRole('dialog', {
      name: 'Choose a session root',
    })
    await within(reopened).findByText('~/docs/projects/agentic-remote')
    expect(within(reopened).getByRole('radio', {
      name: `${knowledgeRoot.name} on ${knowledgeRoot.computerName}: ${knowledgeRoot.path}`,
    })).toBeChecked()
  })

  it('keeps expansion state separate for sessions using different paths in one root', async () => {
    const firstKey = `${computer.id}:${session.id}`
    const secondKey = `${computer.id}:${secondSession.id}`
    mockKnowledgeRoots([knowledgeRoot])
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    fixtureKnowledgeBindings.set(firstKey, {
      computerId: computer.id,
      sessionId: session.id,
      rootId: knowledgeRoot.id,
      rootPath: 'projects/first',
      root: knowledgeRoot,
      revision: 1,
      available: true,
    })
    fixtureKnowledgeBindings.set(secondKey, {
      computerId: computer.id,
      sessionId: secondSession.id,
      rootId: knowledgeRoot.id,
      rootPath: 'projects/second',
      root: knowledgeRoot,
      revision: 1,
      available: true,
    })
    localStorage.setItem('agentic-remote:knowledge-session-positions', JSON.stringify({
      [firstKey]: {
        rootId: knowledgeRoot.id,
        rootPath: 'projects/first',
        path: '.',
      },
      [secondKey]: {
        rootId: knowledgeRoot.id,
        rootPath: 'projects/second',
        path: '.',
      },
    }))
    localStorage.setItem('agentic-remote:knowledge-expanded', JSON.stringify({
      [`${knowledgeRoot.id}:projects/first`]: ['first-child'],
      [`${knowledgeRoot.id}:projects/second`]: ['second-child'],
    }))
    vi.mocked(listKnowledgeEntries).mockImplementation(
      async (_rootId, path = '.', basePath = '.') => ({
        path,
        parent: path === '.' ? undefined : '.',
        entries: path === '.'
          ? [{
              name: basePath.endsWith('/first') ? 'first-child' : 'second-child',
              path: basePath.endsWith('/first') ? 'first-child' : 'second-child',
              kind: 'directory',
            }]
          : [],
      }),
    )

    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    await screen.findByRole('treeitem', { name: 'first-child' })
    expect(screen.queryByRole('treeitem', { name: 'second-child' }))
      .not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Second chat,/ }))
    await screen.findByRole('treeitem', { name: 'second-child' })
    expect(screen.queryByRole('treeitem', { name: 'first-child' }))
      .not.toBeInTheDocument()
    expect(listKnowledgeEntries).toHaveBeenCalledWith(
      knowledgeRoot.id,
      '.',
      'projects/second',
    )

    const stored = JSON.parse(
      localStorage.getItem('agentic-remote:knowledge-expanded') || '{}',
    )
    expect(stored[`${knowledgeRoot.id}:projects/first`]).toEqual(['first-child'])
    expect(stored[`${knowledgeRoot.id}:projects/second`]).toEqual(['second-child'])
  })

  it('adds a browsed subfolder to shared Knowledge only when explicitly saved', async () => {
    const savedRoot: KnowledgeRoot = {
      ...knowledgeRoot,
      id: 'saved-project-root',
      name: 'projects',
      path: `${knowledgeRoot.path}/projects`,
    }
    mockKnowledgeRoots([knowledgeRoot])
    mockAddedKnowledgeRoot(savedRoot)
    vi.mocked(listDirectories).mockImplementation(async (_computerId, path) =>
      path === savedRoot.path
        ? {
            path,
            parent: knowledgeRoot.path,
            directories: [],
          }
        : {
            path: knowledgeRoot.path,
            directories: [{ name: 'projects', path: savedRoot.path }],
          },
    )
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })

    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    fireEvent.click(await screen.findByRole('button', {
      name: 'Choose Knowledge root',
    }))
    const chooser = await screen.findByRole('dialog', {
      name: 'Choose a session root',
    })
    const optionCount = within(chooser).getAllByRole('radio').length
    fireEvent.click(await within(chooser).findByRole('button', { name: 'projects' }))

    expect(within(chooser).getAllByRole('radio')).toHaveLength(optionCount)
    expect(within(chooser).queryByRole('radio', {
      name: `projects on ${savedRoot.computerName}: ${savedRoot.path}`,
    })).not.toBeInTheDocument()
    fireEvent.click(await within(chooser).findByRole('button', {
      name: 'Save this root folder',
    }))

    await waitFor(() =>
      expect(addKnowledgeRoot).toHaveBeenCalledWith({
        computerId: savedRoot.computerId,
        path: savedRoot.path,
      }),
    )
    expect(updateSessionKnowledgeRoot).toHaveBeenCalledWith(
      computer.id,
      session.id,
      {
        rootId: savedRoot.id,
        expectedRevision: 1,
      },
    )
    fireEvent.click(screen.getByRole('button', { name: 'Choose Knowledge root' }))
    const reopened = await screen.findByRole('dialog', {
      name: 'Choose a session root',
    })
    expect(within(reopened).getByRole('radio', {
      name: `projects on ${savedRoot.computerName}: ${savedRoot.path}`,
    })).toBeChecked()
  })

  it('uses the hub root rather than a document remembered under another root', async () => {
    const other = { ...knowledgeRoot, id: 'other-root', name: 'Other notes', path: '/srv/other' }
    mockKnowledgeRoots([knowledgeRoot, other])
    const key = `${computer.id}:${session.id}`
    localStorage.setItem('agentic-remote:knowledge-session-positions', JSON.stringify({
      [key]: { rootId: knowledgeRoot.id, path: '.', file: 'old.md' },
    }))
    fixtureKnowledgeBindings.set(key, {
      computerId: computer.id, sessionId: session.id, rootId: other.id,
      root: other, revision: 3, available: true,
    })
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    await screen.findAllByText('Other notes')
    await screen.findByRole('tree')
    expect(readKnowledgeFile).not.toHaveBeenCalled()
    expect(vi.mocked(listKnowledgeEntries).mock.calls.every(([id]) => id === other.id)).toBe(true)
    expect(JSON.parse(localStorage.getItem('agentic-remote:knowledge-session-positions') || '{}')[key])
      .toEqual({ rootId: other.id, path: '.' })
    expect(updateSessionKnowledgeRoot).not.toHaveBeenCalled()
  })

  it.each(['live update', 'lookup', 'late catalog'])('learns a newly linked root missing from this client catalog (%s)', async (source) => {
    const added = { ...knowledgeRoot, id: 'new-root', name: 'New notes', path: '/srv/new-notes' }
    const key = `${computer.id}:${session.id}`
    const binding: SessionKnowledgeBinding = {
      computerId: computer.id, sessionId: session.id, rootId: added.id,
      root: added, revision: 2, available: true,
    }
    mockKnowledgeRoots([knowledgeRoot])
    let finishRoots: ((roots: KnowledgeRoot[]) => void) | undefined
    if (source === 'late catalog') {
      vi.mocked(listKnowledgeRoots).mockReturnValueOnce(new Promise((resolve) => { finishRoots = resolve }))
    } else {
      vi.mocked(listKnowledgeRoots).mockResolvedValueOnce([knowledgeRoot])
    }
    if (source === 'lookup') {
      fixtureKnowledgeRoots.push(added)
      fixtureKnowledgeBindings.set(key, binding)
    }
    vi.mocked(listKnowledgeEntries).mockImplementation(async (id) => ({
      path: '.',
      entries: [{ name: id === added.id ? 'new.md' : 'previous.md', path: 'guide.md', kind: 'markdown' }],
    }))
    vi.mocked(readKnowledgeFile).mockImplementation(async (id) => ({
      name: 'guide.md', path: 'guide.md', kind: 'markdown', mimeType: 'text/markdown',
      size: 20, content: id === added.id ? '# New guide' : '# Previous guide',
    }))
    render(<App />)
    fireEvent.change(await screen.findByLabelText('Message'), { target: { value: 'Keep my draft' } })
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    if (source !== 'lookup') {
      await screen.findByText('Saved for this session')
      if (source === 'live update') {
        fireEvent.click(await screen.findByRole('treeitem', { name: 'previous.md' }))
        await screen.findByRole('heading', { name: 'Previous guide' })
      }
      fixtureKnowledgeRoots.push(added)
      fixtureKnowledgeBindings.set(key, binding)
      await act(async () => {
        MockWebSocket.instances.at(-1)?.onmessage?.({
          data: JSON.stringify({
            type: 'session.knowledge.updated', computerId: computer.id, sessionId: session.id, binding,
          }),
        } as MessageEvent)
        finishRoots?.([knowledgeRoot])
      })
    }
    const newFile = await screen.findByRole('treeitem', { name: 'new.md' })
    expect(screen.queryByText('Saved folder unavailable')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Previous guide' })).not.toBeInTheDocument()
    fireEvent.click(newFile)
    await screen.findByRole('heading', { name: 'New guide' })
    expect(readKnowledgeFile).toHaveBeenLastCalledWith(added.id, 'guide.md')
    expect(screen.getByLabelText('Message')).toHaveValue('Keep my draft')
    expect(updateSessionKnowledgeRoot).not.toHaveBeenCalled()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('does not reintroduce a root from an unavailable binding, stale update, or delayed catalog', async () => {
    mockKnowledgeRoots([knowledgeRoot])
    let finishRoots!: (roots: KnowledgeRoot[]) => void
    vi.mocked(listKnowledgeRoots).mockReturnValueOnce(new Promise((resolve) => { finishRoots = resolve }))
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    await screen.findByText('Saved for this session')
    // The saved root's tree loads separately from its status. Let that first
    // listing settle so only listings caused by the updates below are counted.
    await within(await screen.findByRole('tree')).findByText('Empty folder')
    expect(listKnowledgeEntries).toHaveBeenCalledWith(knowledgeRoot.id, '.')
    const previous = fixtureKnowledgeBinding(computer.id, session.id)
    const removed = { ...previous, revision: 2, available: false }
    fixtureKnowledgeRoots = []
    fixtureKnowledgeBindings.set(`${computer.id}:${session.id}`, removed)
    vi.mocked(listKnowledgeEntries).mockClear()
    await act(async () => {
      for (const binding of [removed, previous]) {
        MockWebSocket.instances.at(-1)?.onmessage?.({
          data: JSON.stringify({
            type: 'session.knowledge.updated', computerId: computer.id, sessionId: session.id, binding,
          }),
        } as MessageEvent)
      }
      finishRoots([knowledgeRoot])
    })
    await screen.findByText('Saved folder unavailable')
    expect(screen.queryByRole('tree')).not.toBeInTheDocument()
    expect(listKnowledgeEntries).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Choose Knowledge root' }))
    expect(screen.queryByRole('radio', {
      name: `${knowledgeRoot.name} on ${knowledgeRoot.computerName}: ${knowledgeRoot.path}`,
    })).not.toBeInTheDocument()
  })

  it('does not revive a locally removed root from a late binding or a stale retry catalog', async () => {
    mockKnowledgeRoots([knowledgeRoot])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    await screen.findByRole('tree')
    const previous = fixtureKnowledgeBinding(computer.id, session.id)
    fireEvent.click(screen.getByRole('button', { name: 'Choose Knowledge root' }))
    fireEvent.click(screen.getByText('Manage shared folders'))
    fireEvent.click(screen.getByRole('button', {
      name: `Review removal of ${knowledgeRoot.name} on ${knowledgeRoot.computerName}`,
    }))
    const confirmation = await screen.findByRole('dialog', { name: 'Remove Knowledge folder?' })
    let finishLookup!: (binding: SessionKnowledgeBinding) => void
    vi.mocked(getSessionKnowledgeRoot).mockReturnValueOnce(new Promise((resolve) => { finishLookup = resolve }))
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Remove from Knowledge' }))
    await waitFor(() => expect(confirmation).not.toBeInTheDocument())
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Choose a session root' }))
      .getByRole('button', { name: 'Cancel' }))
    await screen.findByText('Saved folder unavailable')
    const late = { ...previous, revision: 2 }
    await act(async () => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({
          type: 'session.knowledge.updated', computerId: computer.id, sessionId: session.id, binding: late,
        }),
      } as MessageEvent)
      finishLookup(late)
    })
    vi.mocked(listKnowledgeEntries).mockClear()
    vi.mocked(listKnowledgeRoots).mockResolvedValueOnce([knowledgeRoot])
    fireEvent.click(screen.getByRole('button', { name: 'Retry saved root' }))
    await waitFor(() => expect(listKnowledgeRoots).toHaveBeenCalledTimes(2))
    expect(screen.getByText('Saved folder unavailable')).toBeVisible()
    expect(screen.queryByRole('tree')).not.toBeInTheDocument()
    expect(listKnowledgeEntries).not.toHaveBeenCalled()
  })

  it.each(['response', 'failure'])('keeps a newer catalog retry authoritative over an older startup %s', async (outcome) => {
    const fresh = { ...knowledgeRoot, id: 'fresh-root', name: 'Current catalog folder' }
    const stale = { ...knowledgeRoot, id: 'stale-root', name: 'Obsolete catalog folder' }
    mockKnowledgeRoots([knowledgeRoot])
    let finishRoots!: (roots: KnowledgeRoot[]) => void
    let failRoots!: (error: Error) => void
    vi.mocked(listKnowledgeRoots).mockReturnValueOnce(new Promise((resolve, reject) => {
      finishRoots = resolve
      failRoots = reject
    }))
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    await screen.findByText('Saved for this session')
    const removed = { ...fixtureKnowledgeBinding(computer.id, session.id), available: false }
    fixtureKnowledgeRoots = [fresh]
    act(() => MockWebSocket.instances.at(-1)?.onmessage?.({
      data: JSON.stringify({
        type: 'session.knowledge.updated', computerId: computer.id, sessionId: session.id, binding: removed,
      }),
    } as MessageEvent))
    await screen.findByText('Saved folder unavailable')
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Retry saved root' })))
    expect(listKnowledgeRoots).toHaveBeenCalledTimes(2)
    await act(async () => {
      if (outcome === 'response') finishRoots([stale])
      else failRoots(new Error('Stale catalog failure'))
    })
    expect(screen.queryByText('Stale catalog failure')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Choose Knowledge root' }))
    expect(screen.getByRole('radio', {
      name: `${fresh.name} on ${fresh.computerName}: ${fresh.path}`,
    })).toBeEnabled()
    expect(screen.queryByRole('radio', {
      name: `${stale.name} on ${stale.computerName}: ${stale.path}`,
    })).not.toBeInTheDocument()
  })

  it('rejects an explicit root add overtaken by that root being removed', async () => {
    const added = { ...knowledgeRoot, id: 'added-root', name: 'Removed during add', path: session.cwd }
    mockKnowledgeRoots([knowledgeRoot])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })
    let finishAdding!: (root: KnowledgeRoot) => void
    vi.mocked(addKnowledgeRoot).mockReturnValueOnce(new Promise((resolve) => { finishAdding = resolve }))
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    await screen.findByRole('tree')
    fireEvent.click(screen.getByRole('button', { name: 'New knowledge root' }))
    const dialog = await screen.findByRole('dialog', { name: 'Add knowledge root' })
    const add = within(dialog).getByRole('button', { name: 'Add this folder' })
    await waitFor(() => expect(add).toBeEnabled())
    fireEvent.click(add)
    await waitFor(() => expect(addKnowledgeRoot).toHaveBeenCalledOnce())
    await act(async () => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({
          type: 'session.knowledge.updated', computerId: computer.id, sessionId: session.id,
          binding: {
            computerId: computer.id, sessionId: session.id, rootId: added.id,
            root: added, revision: 2, available: false,
          },
        }),
      } as MessageEvent)
      finishAdding(added)
    })
    expect(within(dialog).getByText(
      'This Knowledge folder was removed while it was being added. Choose the folder again.',
    )).toBeVisible()
    expect(updateSessionKnowledgeRoot).not.toHaveBeenCalled()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it.each([false, true])('does not import an unpaired root from a late available binding (paired again: %s)', async (repaired) => {
    const remoteRoot = { ...knowledgeRoot, computerId: secondComputer.id, computerName: secondComputer.name }
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    mockKnowledgeRoots([remoteRoot])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    await screen.findByRole('tree')
    const previous = fixtureKnowledgeBinding(computer.id, session.id)
    fixtureKnowledgeRoots = []
    await act(async () => {
      const socket = MockWebSocket.instances.at(-1)!
      socket.onmessage?.({
        data: JSON.stringify({ type: 'computer.removed', computerId: secondComputer.id }),
      } as MessageEvent)
      if (repaired) {
        socket.onmessage?.({
          data: JSON.stringify({ type: 'computer.updated', computer: secondComputer }),
        } as MessageEvent)
      }
      socket.onmessage?.({
        data: JSON.stringify({
          type: 'session.knowledge.updated', computerId: computer.id, sessionId: session.id,
          binding: { ...previous, revision: 2 },
        }),
      } as MessageEvent)
    })
    await screen.findByText('Saved folder unavailable')
    expect(screen.queryByRole('tree')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Choose Knowledge root' }))
    expect(screen.queryByRole('radio', {
      name: `${remoteRoot.name} on ${remoteRoot.computerName}: ${remoteRoot.path}`,
    })).not.toBeInTheDocument()
  })

  it('keeps a pending root choice after a conflict and retries the reviewed revision', async () => {
    const other = { ...knowledgeRoot, id: 'other-root', name: 'Other notes', path: '/srv/other' }
    mockKnowledgeRoots([knowledgeRoot, other])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    await screen.findByText('Saved for this session')
    fireEvent.click(screen.getByRole('button', { name: 'Choose Knowledge root' }))
    const chooser = await screen.findByRole('dialog', { name: 'Choose a session root' })
    const candidate = within(chooser).getByRole('radio', {
      name: `${other.name} on ${other.computerName}: ${other.path}`,
    })
    fireEvent.click(candidate)
    const key = `${computer.id}:${session.id}`
    const changed = { ...fixtureKnowledgeBinding(computer.id, session.id), revision: 2 }
    fixtureKnowledgeBindings.set(key, changed)
    act(() => MockWebSocket.instances.at(-1)?.onmessage?.({
      data: JSON.stringify({
        type: 'session.knowledge.updated', computerId: computer.id, sessionId: session.id, binding: changed,
      }),
    } as MessageEvent))
    fireEvent.click(within(chooser).getByRole('button', { name: 'Use for this session' }))
    await within(chooser).findByText('Root changed in another client')
    expect(candidate).toBeChecked()
    expect(fixtureKnowledgeBindings.get(key)?.rootId).toBe(knowledgeRoot.id)
    const retry = within(chooser).getByRole('button', { name: 'Use for this session' })
    await waitFor(() => expect(retry).toBeEnabled())
    fireEvent.click(retry)
    await waitFor(() => expect(chooser).not.toBeInTheDocument())
    expect(updateSessionKnowledgeRoot).toHaveBeenLastCalledWith(computer.id, session.id, {
      rootId: other.id, expectedRevision: 2,
    })
    expect(fixtureKnowledgeBindings.get(key)?.rootId).toBe(other.id)
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('does not overwrite a newer binding while validating the session folder', async () => {
    mockKnowledgeRoots([knowledgeRoot])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })
    let finishAdding!: (root: KnowledgeRoot) => void
    vi.mocked(addKnowledgeRoot).mockReturnValue(new Promise((resolve) => { finishAdding = resolve }))
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    await screen.findByText('Saved for this session')
    fireEvent.click(screen.getByRole('button', { name: 'Choose Knowledge root' }))
    const chooser = await screen.findByRole('dialog', { name: 'Choose a session root' })
    fireEvent.click(within(chooser).getByRole('radio', { name: "Use this session's folder" }))
    fireEvent.click(within(chooser).getByRole('button', { name: 'Use for this session' }))
    await waitFor(() => expect(addKnowledgeRoot).toHaveBeenCalledWith({
      computerId: computer.id, path: session.cwd,
    }))
    const key = `${computer.id}:${session.id}`
    const newer = { ...fixtureKnowledgeBinding(computer.id, session.id), revision: 2 }
    fixtureKnowledgeBindings.set(key, newer)
    act(() => MockWebSocket.instances.at(-1)?.onmessage?.({
      data: JSON.stringify({
        type: 'session.knowledge.updated', computerId: computer.id, sessionId: session.id, binding: newer,
      }),
    } as MessageEvent))
    const added = { ...knowledgeRoot, id: 'new-root', name: 'Project files', path: session.cwd }
    fixtureKnowledgeRoots.push(added)
    await act(async () => finishAdding(added))
    await within(chooser).findByText('Root changed in another client')
    expect(updateSessionKnowledgeRoot).toHaveBeenCalledWith(computer.id, session.id, {
      rootId: added.id, expectedRevision: 1,
    })
    expect(fixtureKnowledgeBindings.get(key)?.rootId).toBe(knowledgeRoot.id)
    expect(fixtureKnowledgeBindings.get(key)?.revision).toBe(2)
    expect(executeCommand).not.toHaveBeenCalled()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('closes the chooser after a committed save despite unrelated computer removal', async () => {
    const other = { ...knowledgeRoot, id: 'other-root', name: 'Other notes', path: '/srv/other' }
    mockKnowledgeRoots([knowledgeRoot, other])
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })
    let finish!: (value: SessionKnowledgeBinding) => void
    vi.mocked(updateSessionKnowledgeRoot).mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    await screen.findByText('Saved for this session')
    fireEvent.click(screen.getByRole('button', { name: 'Choose Knowledge root' }))
    const chooser = await screen.findByRole('dialog', { name: 'Choose a session root' })
    fireEvent.click(within(chooser).getByRole('radio', {
      name: `${other.name} on ${other.computerName}: ${other.path}`,
    }))
    fireEvent.click(within(chooser).getByRole('button', { name: 'Use for this session' }))
    await waitFor(() => expect(updateSessionKnowledgeRoot).toHaveBeenCalledOnce())
    const saved: SessionKnowledgeBinding = {
      computerId: computer.id, sessionId: session.id, rootId: other.id,
      root: other, revision: 2, available: true,
    }
    fixtureKnowledgeBindings.set(`${computer.id}:${session.id}`, saved)
    act(() => MockWebSocket.instances.at(-1)?.onmessage?.({
      data: JSON.stringify({ type: 'computer.removed', computerId: secondComputer.id }),
    } as MessageEvent))
    await act(async () => finish(saved))
    await waitFor(() => expect(chooser).not.toBeInTheDocument())
    expect(updateSessionKnowledgeRoot).toHaveBeenCalledExactlyOnceWith(computer.id, session.id, {
      rootId: other.id, expectedRevision: 1,
    })
    expect(screen.queryByText(/pairing changed while saving/)).not.toBeInTheDocument()
    expect(fixtureKnowledgeBindings.get(`${computer.id}:${session.id}`)).toEqual(saved)
  })

  it.each(['before browsing', 'before creating', 'during creation'] as const)(
    'keeps the reviewed revision when another client changes the root %s',
    async (timing) => {
      const added = { ...knowledgeRoot, id: 'browsed-root', name: 'Browsed files', path: '/home/tester/browsed' }
      mockKnowledgeRoots([knowledgeRoot])
      mockAddedKnowledgeRoot(added)
      vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })
      vi.mocked(listDirectories).mockResolvedValue({ path: added.path, directories: [] })
      let finishAdding: ((root: KnowledgeRoot) => void) | undefined
      if (timing === 'during creation') {
        vi.mocked(addKnowledgeRoot).mockReturnValueOnce(new Promise((resolve) => { finishAdding = resolve }))
      }
      render(<App />)
      fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
      await screen.findByText('Saved for this session')
      fireEvent.click(screen.getByRole('button', { name: 'Choose Knowledge root' }))
      const chooser = await screen.findByRole('dialog', { name: 'Choose a session root' })
      const key = `${computer.id}:${session.id}`
      const changeBinding = () => {
        const newer = { ...fixtureKnowledgeBinding(computer.id, session.id), revision: 2 }
        fixtureKnowledgeBindings.set(key, newer)
        act(() => MockWebSocket.instances.at(-1)?.onmessage?.({
          data: JSON.stringify({
            type: 'session.knowledge.updated', computerId: computer.id, sessionId: session.id, binding: newer,
          }),
        } as MessageEvent))
      }
      if (timing === 'before browsing') changeBinding()
      fireEvent.click(within(chooser).getByRole('button', { name: /Browse another folder/ }))
      const folder = await screen.findByRole('dialog', { name: 'Add knowledge root' })
      const confirm = within(folder).getByRole('button', { name: 'Add this folder' })
      await waitFor(() => expect(confirm).toBeEnabled())
      if (timing === 'before creating') changeBinding()
      fireEvent.click(confirm)
      if (timing === 'during creation') {
        await waitFor(() => expect(addKnowledgeRoot).toHaveBeenCalledOnce())
        changeBinding()
        fixtureKnowledgeRoots.push(added)
        await act(async () => finishAdding?.(added))
      }
      await within(folder).findByText('Root changed in another client')
      expect(updateSessionKnowledgeRoot).toHaveBeenCalledWith(computer.id, session.id, {
        rootId: added.id, expectedRevision: 1,
      })
      expect(fixtureKnowledgeBindings.get(key)).toMatchObject({ rootId: knowledgeRoot.id, revision: 2 })
      await waitFor(() => expect(confirm).toBeEnabled())
      fireEvent.click(confirm)
      await waitFor(() => expect(folder).not.toBeInTheDocument())
      expect(updateSessionKnowledgeRoot).toHaveBeenLastCalledWith(computer.id, session.id, {
        rootId: added.id, expectedRevision: 2,
      })
      expect(fixtureKnowledgeBindings.get(key)).toMatchObject({ rootId: added.id, revision: 3 })
      expect(sendMessage).not.toHaveBeenCalled()
      expect(executeCommand).not.toHaveBeenCalled()
    },
  )

  it.each(['New knowledge root', 'Add a Knowledge folder', 'New Knowledge folder', 'empty catalog', 'late empty catalog'])(
    'captures the starting binding revision for the %s creation flow',
    async (entry) => {
      const empty = entry.includes('empty catalog')
      const initialRevision = empty ? 0 : 1
      const key = `${computer.id}:${session.id}`
      const initial: SessionKnowledgeBinding = {
        computerId: computer.id, sessionId: session.id,
        rootId: empty ? null : knowledgeRoot.id,
        root: empty ? undefined : knowledgeRoot, revision: initialRevision, available: !empty,
      }
      fixtureKnowledgeBindings.set(key, initial)
      mockKnowledgeRoots(empty ? [] : [knowledgeRoot])
      const added = { ...knowledgeRoot, id: 'direct-added-root', name: 'Direct folder', path: '/home/tester/direct' }
      mockAddedKnowledgeRoot(added)
      vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })
      vi.mocked(listDirectories).mockResolvedValue({ path: added.path, directories: [] })
      let finishLookup: ((binding: SessionKnowledgeBinding) => void) | undefined
      if (entry === 'late empty catalog') {
        vi.mocked(getSessionKnowledgeRoot).mockReturnValueOnce(new Promise((resolve) => { finishLookup = resolve }))
      }
      render(<App />)
      fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
      if (finishLookup) {
        await waitFor(() => expect(getSessionKnowledgeRoot).toHaveBeenCalled())
        await act(async () => finishLookup?.(initial))
      }
      if (!empty) {
        await screen.findByText('Saved for this session')
        if (entry === 'New Knowledge folder') {
          fireEvent.click(screen.getByRole('button', { name: 'Show files' }))
        }
        fireEvent.click(screen.getAllByRole('button', { name: entry })[0])
      }
      const folder = await screen.findByRole('dialog', { name: 'Add knowledge root' })
      const confirm = within(folder).getByRole('button', { name: 'Add this folder' })
      await waitFor(() => expect(confirm).toBeEnabled())
      const newer: SessionKnowledgeBinding = {
        ...initial, rootId: knowledgeRoot.id, root: knowledgeRoot,
        revision: initialRevision + 1, available: true,
      }
      if (empty) fixtureKnowledgeRoots.push(knowledgeRoot)
      fixtureKnowledgeBindings.set(key, newer)
      act(() => MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({
          type: 'session.knowledge.updated', computerId: computer.id, sessionId: session.id, binding: newer,
        }),
      } as MessageEvent))
      fireEvent.click(confirm)
      await within(folder).findByText('Root changed in another client')
      expect(updateSessionKnowledgeRoot).toHaveBeenCalledWith(computer.id, session.id, {
        rootId: added.id, expectedRevision: initialRevision,
      })
      expect(fixtureKnowledgeBindings.get(key)).toEqual(newer)
      await waitFor(() => expect(confirm).toBeEnabled())
      fireEvent.click(confirm)
      await waitFor(() => expect(folder).not.toBeInTheDocument())
      expect(updateSessionKnowledgeRoot).toHaveBeenLastCalledWith(computer.id, session.id, {
        rootId: added.id, expectedRevision: newer.revision,
      })
      expect(sendMessage).not.toHaveBeenCalled()
      expect(executeCommand).not.toHaveBeenCalled()
    },
  )

  afterEach(() => {
    restoreScrollTop?.()
    restoreScrollTop = undefined
  })

  it('caps composer growth for iPhone viewport heights', () => {
    expect(composerMaximumHeight(true, 844)).toBe(104)
    expect(composerMaximumHeight(true, 430)).toBe(72)
    expect(composerMaximumHeight(false, 430)).toBe(180)
  })

  describe('settings that follow you between devices', () => {
    const appShell = () => document.querySelector('.app-shell')
    let restoreMatchMedia: (() => void) | undefined

    afterEach(() => {
      restoreMatchMedia?.()
      restoreMatchMedia = undefined
    })

    /** A device whose OS light/dark preference the test can change. */
    function deviceScheme(light: boolean) {
      const original = Object.getOwnPropertyDescriptor(window, 'matchMedia')
      const listeners = new Set<() => void>()
      let prefersLight = light
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        value: (query: string) => ({
          get matches() {
            return query === '(prefers-color-scheme: light)' ? prefersLight : false
          },
          media: query,
          onchange: null,
          addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
          removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
          addListener: () => undefined,
          removeListener: () => undefined,
          dispatchEvent: () => false,
        }),
      })
      restoreMatchMedia = () => {
        if (original) Object.defineProperty(window, 'matchMedia', original)
        else Reflect.deleteProperty(window, 'matchMedia')
      }
      return (next: boolean) => {
        prefersLight = next
        act(() => listeners.forEach((listener) => listener()))
      }
    }

    it('keeps an explicit appearance and accent on the hub and across a reopened tab', async () => {
      const rendered = render(<App />)
      await screen.findByLabelText('Message')
      fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
      expect(await screen.findByRole('radio', { name: 'System appearance' })).toBeChecked()
      fireEvent.click(screen.getByRole('radio', { name: 'Ocean accent' }))
      fireEvent.click(screen.getByRole('radio', { name: 'Light appearance' }))
      expect(appShell()).toHaveAttribute('data-appearance', 'light')
      expect(appShell()).toHaveAttribute('data-accent-theme', 'ocean')
      expect(document.documentElement).toHaveAttribute('data-appearance', 'light')
      await waitFor(() =>
        expect(hubSettings.values).toEqual({ accent: 'ocean', appearance: 'light' }))
      expect(await screen.findByText('Saved on this hub.')).toBeVisible()
      // Nothing is kept per tab any more.
      expect(sessionStorage.getItem('agentic-remote:accent-theme')).toBeNull()
      rendered.unmount()

      // A closed and reopened tab paints from this device's copy before the
      // hub answers.
      sessionStorage.clear()
      vi.mocked(fetchSettingsProfile).mockImplementation(() => new Promise(() => {}))
      render(<App />)
      await screen.findByLabelText('Message')
      expect(appShell()).toHaveAttribute('data-appearance', 'light')
      expect(appShell()).toHaveAttribute('data-accent-theme', 'ocean')
    })

    it('follows the device’s light or dark setting until a choice is made', async () => {
      const setDeviceLight = deviceScheme(true)
      render(<App />)
      await screen.findByLabelText('Message')
      expect(appShell()).toHaveAttribute('data-appearance', 'light')
      setDeviceLight(false)
      expect(appShell()).toHaveAttribute('data-appearance', 'graphite')

      fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
      fireEvent.click(await screen.findByRole('radio', { name: 'Graphite appearance' }))
      setDeviceLight(true)
      // A choice is a choice: the device's setting no longer moves it.
      expect(appShell()).toHaveAttribute('data-appearance', 'graphite')
      await waitFor(() => expect(hubSettings.values).toEqual({ appearance: 'graphite' }))

      fireEvent.click(screen.getByRole('radio', { name: 'System appearance' }))
      expect(appShell()).toHaveAttribute('data-appearance', 'light')
      await waitFor(() => expect(hubSettings.values).toEqual({ appearance: 'system' }))
    })

    it('loads the hub’s settings on a device that has none, as after signing back in', async () => {
      seedHubSettings({ accent: 'teal', appearance: 'light', sessionSort: 'name' })
      render(<App />)
      await screen.findByLabelText('Message')
      await waitFor(() => expect(appShell()).toHaveAttribute('data-accent-theme', 'teal'))
      expect(appShell()).toHaveAttribute('data-appearance', 'light')
      expect(screen.getByRole('combobox', { name: 'Session order' })).toHaveValue('name')
      expect(importSettingsProfile).not.toHaveBeenCalled()
    })

    it('applies a change made on another device as it arrives', async () => {
      render(<App />)
      await screen.findByLabelText('Message')
      await waitFor(() => expect(fetchSettingsProfile).toHaveBeenCalled())
      act(() => MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({
          type: 'settings.updated',
          settings: {
            profileId: hubSettingsId,
            revision: 4,
            values: { accent: 'rose', appearance: 'light', statusline: { model: false } },
          },
        }),
      } as MessageEvent))
      expect(appShell()).toHaveAttribute('data-accent-theme', 'rose')
      expect(appShell()).toHaveAttribute('data-appearance', 'light')
    })

    it('tells you when another device changed a setting first', async () => {
      render(<App />)
      await screen.findByLabelText('Message')
      await waitFor(() => expect(fetchSettingsProfile).toHaveBeenCalled())
      await act(async () => {})
      // Another device commits while this one has not heard about it.
      hubSettings = applySettingsChanges(
        hubSettings,
        validateSettingsChanges({ accent: { value: 'violet', baseRevision: 0 } }),
      ).record
      fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
      fireEvent.click(await screen.findByRole('radio', { name: 'Teal accent' }))
      expect(await screen.findByText(
        'Accent was changed on another device first, so this device now uses that choice.',
      )).toBeVisible()
      expect(appShell()).toHaveAttribute('data-accent-theme', 'violet')
      expect(hubSettings.values.accent).toBe('violet')
    })

    it('keeps changes while the hub is unreachable and sends them on reconnect', async () => {
      render(<App />)
      await screen.findByLabelText('Message')
      await waitFor(() => expect(fetchSettingsProfile).toHaveBeenCalled())
      await act(async () => {})
      vi.mocked(saveSettingsChanges).mockRejectedValueOnce(new TypeError('Failed to fetch'))
      fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
      fireEvent.click(await screen.findByRole('radio', { name: 'Light appearance' }))
      expect(await screen.findByText(
        'The hub can’t be reached. Changes are kept on this device and sync when it’s back.',
      )).toBeVisible()
      expect(appShell()).toHaveAttribute('data-appearance', 'light')
      expect(hubSettings.values).toEqual({})

      await act(async () => { MockWebSocket.instances.at(-1)?.onopen?.() })
      await waitFor(() => expect(hubSettings.values).toEqual({ appearance: 'light' }))
      expect(await screen.findByText('Saved on this hub.')).toBeVisible()
    })

    it('keeps saving to the hub when this browser cannot keep a copy', async () => {
      const original = Storage.prototype.setItem
      const save = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
        this: Storage, key: string, value: string,
      ) {
        if (key === 'agentic-remote:settings-profile') throw new Error('Storage unavailable')
        original.call(this, key, value)
      })
      try {
        render(<App />)
        await screen.findByLabelText('Message')
        fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
        fireEvent.click(await screen.findByRole('radio', { name: 'Light appearance' }))
        expect(appShell()).toHaveAttribute('data-appearance', 'light')
        await waitFor(() => expect(hubSettings.values).toEqual({ appearance: 'light' }))
        expect(await screen.findByText(
          'Saved on this hub. This browser can’t keep a copy, so settings load from the hub each time.',
        )).toBeVisible()
      } finally {
        save.mockRestore()
      }
    })

    it('brings this browser’s earlier settings to the hub once', async () => {
      localStorage.setItem('agentic-remote:appearance', JSON.stringify('light'))
      localStorage.setItem('agentic-remote:session-sort', JSON.stringify('name'))
      sessionStorage.setItem('agentic-remote:accent-theme', 'rose')
      const rendered = render(<App />)
      await screen.findByLabelText('Message')
      expect(appShell()).toHaveAttribute('data-accent-theme', 'rose')
      expect(appShell()).toHaveAttribute('data-appearance', 'light')
      await waitFor(() => expect(hubSettings.values).toEqual({
        appearance: 'light', accent: 'rose', sessionSort: 'name',
      }))
      expect(importSettingsProfile).toHaveBeenCalledTimes(1)
      rendered.unmount()
      render(<App />)
      await screen.findByLabelText('Message')
      await waitFor(() => expect(fetchSettingsProfile).toHaveBeenCalledTimes(2))
      expect(importSettingsProfile).toHaveBeenCalledTimes(1)
    })

    it('chooses how much Oracle writes, for every device on the hub', async () => {
      vi.mocked(getManager).mockResolvedValue({
        available: true, status: 'idle', messages: [], queued: 0, managedSessions: [], settings: {},
      })
      render(<App />)
      await screen.findByLabelText('Message')
      fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
      const dialog = await screen.findByRole('dialog', { name: 'App settings' })
      const style = await within(dialog).findByRole('combobox', { name: 'Oracle response style' })
      // Unset answers Balanced, as Oracle always has.
      expect(style).toHaveValue('balanced')
      expect(within(style).getAllByRole('option').map((option) => option.textContent))
        .toEqual(['Concise', 'Balanced', 'Detailed'])
      const section = style.closest('section')!
      expect(section.querySelector('.settings-scope')).toHaveTextContent('Synced')
      expect(section).toHaveTextContent(
        'Every style keeps errors, uncertainty, what Oracle did, and anything waiting for you.',
      )
      // Oracle's own model and folder settings are not touched by this.
      const { updateManagerSettings } = await import('./api')

      fireEvent.change(style, { target: { value: 'concise' } })
      expect(style).toHaveValue('concise')
      await waitFor(() => expect(hubSettings.values).toEqual({ oracleResponseStyle: 'concise' }))
      expect(updateManagerSettings).not.toHaveBeenCalled()

      // Another device's choice arrives live.
      act(() => MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({
          type: 'settings.updated',
          settings: { profileId: hubSettingsId, revision: 9, values: { oracleResponseStyle: 'detailed' } },
        }),
      } as MessageEvent))
      expect(style).toHaveValue('detailed')
    })

    it('chooses how new sessions start, separately from Oracle', async () => {
      render(<App />)
      await screen.findByLabelText('Message')
      fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
      const dialog = await screen.findByRole('dialog', { name: 'App settings' })
      const backend = await within(dialog).findByRole('combobox', { name: 'How new sessions start' })
      // Unset starts in tmux, as new sessions always have.
      expect(backend).toHaveValue('terminal')
      expect(within(backend).getAllByRole('option').map((option) => option.textContent))
        .toEqual(['Terminal (tmux)', 'Copilot SDK'])
      const { updateManagerSettings } = await import('./api')
      fireEvent.change(backend, { target: { value: 'sdk' } })
      expect(backend).toHaveValue('sdk')
      await waitFor(() => expect(hubSettings.values).toEqual({ newSessionBackend: 'sdk' }))
      expect(updateManagerSettings).not.toHaveBeenCalled()
      fireEvent.change(backend, { target: { value: 'terminal' } })
      await waitFor(() => expect(hubSettings.values).toEqual({}))
    })

    it('leaves out the response style when Oracle is off on this hub', async () => {
      vi.mocked(getManager).mockResolvedValue({
        available: false,
        unavailableReason: 'Oracle is turned off on this hub (AGENTIC_REMOTE_MANAGER=off).',
        status: 'offline', messages: [], queued: 0, managedSessions: [],
      })
      render(<App />)
      await screen.findByLabelText('Message')
      fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
      const dialog = await screen.findByRole('dialog', { name: 'App settings' })
      expect(await within(dialog).findAllByText(/Oracle is turned off on this hub/)).not.toHaveLength(0)
      expect(within(dialog).queryByRole('combobox', { name: 'Oracle response style' })).toBeNull()
    })

    it('shows a change another tab saved without waiting for the hub', async () => {
      render(<App />)
      await screen.findByLabelText('Message')
      await waitFor(() => expect(fetchSettingsProfile).toHaveBeenCalled())
      await act(async () => {})
      const cache = JSON.parse(localStorage.getItem('agentic-remote:settings-profile') || '{}')
      localStorage.setItem('agentic-remote:settings-profile', JSON.stringify({
        ...cache, pending: { accent: { value: 'ember', baseRevision: cache.revision } },
      }))
      act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'agentic-remote:settings-profile' })))
      expect(appShell()).toHaveAttribute('data-accent-theme', 'ember')
    })

    it('chooses which notifications reach every device, apart from what this device can receive', async () => {
      render(<App />)
      await screen.findByLabelText('Message')
      fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
      const dialog = await screen.findByRole('dialog', { name: 'App settings' })
      const scope = within(dialog).getByRole('group', { name: 'What notifies you' })
      const radio = (name: string) => within(scope).getByRole('radio', { name })
      // A hub that never chose sends everything, as before.
      expect(radio('All activity')).toBeChecked()
      expect(radio('All activity')).toHaveAccessibleDescription(
        'Sessions that need you or finish, hub alerts, and Oracle.',
      )
      expect(radio('Oracle only')).toHaveAccessibleDescription(
        'Oracle’s replies and its requests for your OK. Sessions stay quiet, including ones Oracle started.',
      )
      expect(radio('Disabled')).toHaveAccessibleDescription(
        'Nothing, on any device. Each device stays set up, so turning them back on is instant.',
      )
      expect(scope.closest('section')!.querySelector('.settings-scope')).toHaveTextContent('Synced')
      // This browser cannot receive push at all, which is its own business.
      const device = within(dialog).getByRole('heading', { name: 'This device' }).closest('section')!
      expect(device).toHaveTextContent('Push notifications are not supported in this browser.')
      expect(device.querySelector('.settings-scope')).toHaveTextContent('This device')

      fireEvent.click(radio('Oracle only'))
      expect(radio('Oracle only')).toBeChecked()
      await waitFor(() => expect(hubSettings.values).toEqual({ notificationScope: 'oracle' }))

      act(() => MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({
          type: 'settings.updated',
          settings: { profileId: hubSettingsId, revision: 9, values: { notificationScope: 'off' } },
        }),
      } as MessageEvent))
      expect(radio('Disabled')).toBeChecked()
    })

    it('tells the hub while Oracle is on screen, so it holds Oracle’s pushes', async () => {
      vi.mocked(getManager).mockResolvedValue({
        available: true, status: 'idle', messages: [], queued: 0, managedSessions: [],
      })
      const visibility = Object.getOwnPropertyDescriptor(document, 'visibilityState')
      const setVisibility = (value: DocumentVisibilityState) => {
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => value })
        act(() => { document.dispatchEvent(new Event('visibilitychange')) })
      }
      try {
        render(<App />)
        await screen.findByLabelText('Message')
        const socket = MockWebSocket.instances.at(-1)!
        await act(async () => { socket.onopen?.() })
        const presence = () => socket.send.mock.calls
          .map(([data]) => JSON.parse(String(data)))
          .filter((message) => message.type === 'presence')
          .map((message) => message.oracleVisible)
        expect(presence()).toEqual([false])
        const dock = document.querySelector<HTMLElement>('.timeline-dock')!
        fireEvent.click(await within(dock).findByRole('button', { name: 'Oracle' }))
        expect(presence()).toEqual([false, true])
        setVisibility('hidden')
        expect(presence()).toEqual([false, true, false])
        setVisibility('visible')
        expect(presence()).toEqual([false, true, false, true])
        // Renewed while on screen, so the hub never lets it lapse meanwhile.
        vi.useFakeTimers()
        try {
          const toggle = within(dock).getByRole('button', { name: 'Oracle' })
          fireEvent.click(toggle)
          fireEvent.click(toggle)
          expect(presence()).toEqual([false, true, false, true, false, true])
          act(() => { vi.advanceTimersByTime(30_000) })
          expect(presence()).toEqual([false, true, false, true, false, true, true])
        } finally {
          vi.useRealTimers()
        }
      } finally {
        if (visibility) Object.defineProperty(document, 'visibilityState', visibility)
        else Reflect.deleteProperty(document, 'visibilityState')
      }
    })

    it('opens Oracle from one of its notifications', async () => {
      vi.mocked(getManager).mockResolvedValue({
        available: true, status: 'idle', messages: [], queued: 0, managedSessions: [],
      })
      window.history.replaceState({}, '', '/?oracle=open')
      render(<App />)
      expect(await screen.findByRole('dialog', { name: 'Oracle' })).toBeInTheDocument()
    })

    it('raises only what the scope allows in the native shell, Oracle’s replies included', async () => {
      vi.spyOn(shell, 'nativeShell').mockReturnValue(true)
      const raised = vi.spyOn(shell, 'sendShellNotification').mockReturnValue(true)
      seedHubSettings({ notificationScope: 'oracle' })
      // The open session is never announced, so the one that finishes is another.
      vi.mocked(listSessions).mockResolvedValue([session, { ...secondSession, status: 'running' }])
      render(<App />)
      await screen.findByLabelText('Message')
      await waitFor(() => expect(fetchSettingsProfile).toHaveBeenCalled())
      await act(async () => {})
      const emit = (event: unknown) => act(() => MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify(event),
      } as MessageEvent))
      // A session finishing is session activity: quiet in Oracle only.
      await screen.findAllByText(secondSession.title)
      emit({ type: 'session.upserted', session: { ...secondSession, status: 'idle', updatedAt: new Date().toISOString() } })
      emit({ type: 'manager.message', message: {
        id: 'a1', role: 'assistant', replyTo: 'u1', content: 'Both sessions are done.', createdAt: 't',
      } })
      emit({ type: 'manager.message', message: {
        id: 'u1', role: 'user', content: 'Status?', createdAt: 't', state: 'done',
      } })
      emit({ type: 'manager.message', message: {
        id: 'u1', role: 'user', content: 'Status?', createdAt: 't', state: 'done',
      } })
      expect(raised.mock.calls.map(([notification]) => notification)).toEqual([{
        tag: 'agentic-oracle-reply',
        title: 'Oracle replied',
        body: 'Both sessions are done.',
        urgent: false,
      }])
    })

    it.each([
      ['all', 1],
      ['oracle', 0],
      ['off', 0],
    ] as const)('raises hub alerts in the native shell only when the scope is %s-inclusive', async (scope, expected) => {
      vi.spyOn(shell, 'nativeShell').mockReturnValue(true)
      const raised = vi.spyOn(shell, 'sendShellNotification').mockReturnValue(true)
      seedHubSettings({ notificationScope: scope })
      render(<App />)
      await screen.findByLabelText('Message')
      await waitFor(() => expect(fetchSettingsProfile).toHaveBeenCalled())
      await act(async () => {})
      act(() => MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({
          type: 'error', computerId: computer.id, notify: true,
          message: 'Copilot CLI 1.0.98 did not start in a way Agentic Remote can use',
        }),
      } as MessageEvent))
      // An ordinary error is not an alert anywhere.
      act(() => MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({ type: 'error', computerId: computer.id, message: 'A send failed' }),
      } as MessageEvent))
      expect(raised.mock.calls.map(([notification]) => notification)).toEqual(expected ? [{
        tag: `agentic-alert-${computer.id}`,
        title: 'Agentic Remote needs attention',
        body: 'Copilot CLI 1.0.98 did not start in a way Agentic Remote can use',
        urgent: true,
      }] : [])
    })

    it('keeps the choice open when this device has notifications blocked', async () => {
      const restore = [
        ['PushManager', window] as const,
        ['Notification', window] as const,
        ['serviceWorker', navigator] as const,
      ].map(([key, target]) => [key, target, Object.getOwnPropertyDescriptor(target, key)] as const)
      Object.defineProperty(window, 'PushManager', { configurable: true, value: class {} })
      Object.defineProperty(window, 'Notification', { configurable: true, value: { permission: 'denied' } })
      Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: { ready: new Promise(() => {}), getRegistration: async () => undefined },
      })
      try {
        render(<App />)
        await screen.findByLabelText('Message')
        fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
        const dialog = await screen.findByRole('dialog', { name: 'App settings' })
        expect(within(dialog).getByText(/Notifications are blocked/)).toBeVisible()
        fireEvent.click(within(dialog).getByRole('radio', { name: 'Disabled' }))
        await waitFor(() => expect(hubSettings.values).toEqual({ notificationScope: 'off' }))
      } finally {
        for (const [key, target, descriptor] of restore) {
          if (descriptor) Object.defineProperty(target, key, descriptor)
          else Reflect.deleteProperty(target, key)
        }
      }
    })

    it('says which settings follow you and which stay on this device', async () => {
      render(<App />)
      await screen.findByLabelText('Message')
      fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
      const dialog = await screen.findByRole('dialog', { name: 'App settings' })
      const sync = within(dialog).getByRole('heading', { name: 'Settings sync' }).closest('section')!
      expect(sync).toHaveTextContent(
        'Appearance, accent, status line, new-session models and folders, session sort, computer order, Oracle\'s response style, and what notifies you follow you to every device that opens this hub.',
      )
      expect(sync).toHaveTextContent('Keyboard shortcuts, panel widths, and drafts stay on this device.')
      const scope = (heading: string) =>
        within(dialog).getByRole('heading', { name: heading })
          .closest('.app-settings-section__title')?.querySelector('.settings-scope')
      expect(scope('Appearance')).toHaveTextContent('Synced')
      expect(scope('Status line')).toHaveTextContent('Synced')
      expect(scope('New sessions')).toHaveTextContent('Synced')
      expect(scope('Keyboard shortcuts')).toHaveTextContent('This device')
    })
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

  it('fills the installed window when the idle visual viewport is shorter', async () => {
    const originalVisualViewport = window.visualViewport
    const originalMatchMedia = window.matchMedia
    const originalInnerHeight = window.innerHeight
    const visualViewport = new EventTarget() as VisualViewport
    Object.defineProperties(visualViewport, {
      height: { configurable: true, value: 774, writable: true },
      offsetTop: { configurable: true, value: 0, writable: true },
    })
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 852,
    })
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: visualViewport,
    })
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn((query: string) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    const editor = document.createElement('textarea')
    const nextEditor = document.createElement('input')
    const rendered = render(<App />)
    const shell = document.querySelector<HTMLElement>('.app-shell')
    try {
      expect(shell?.style.getPropertyValue('--visual-viewport-height')).toBe(
        '852px',
      )
      expect(shell?.style.getPropertyValue('--visual-viewport-top')).toBe('0px')

      document.body.append(editor)
      document.body.append(nextEditor)
      editor.focus()
      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: 510,
      })
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

      Object.defineProperty(visualViewport, 'offsetTop', {
        configurable: true,
        value: 10,
        writable: true,
      })
      act(() => editor.blur())
      expect(shell).toHaveClass('app-shell--keyboard-open')
      nextEditor.focus()
      act(() => visualViewport.dispatchEvent(new Event('resize')))
      expect(shell).toHaveClass('app-shell--keyboard-open')
      expect(shell?.style.getPropertyValue('--visual-viewport-height')).toBe(
        '510px',
      )

      act(() => nextEditor.blur())
      await waitFor(
        () => expect(shell).not.toHaveClass('app-shell--keyboard-open'),
        { timeout: 700 },
      )
      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: 852,
      })
      Object.defineProperty(visualViewport, 'height', {
        configurable: true,
        value: 774,
        writable: true,
      })
      Object.defineProperty(visualViewport, 'offsetTop', {
        configurable: true,
        value: 0,
        writable: true,
      })
      act(() => visualViewport.dispatchEvent(new Event('resize')))
      await waitFor(() =>
        expect(shell).not.toHaveClass('app-shell--keyboard-open'),
      )
      expect(shell?.style.getPropertyValue('--visual-viewport-height')).toBe(
        '852px',
      )
      expect(shell?.style.getPropertyValue('--visual-viewport-top')).toBe('0px')
    } finally {
      editor.remove()
      nextEditor.remove()
      rendered.unmount()
      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: originalInnerHeight,
      })
      Object.defineProperty(window, 'visualViewport', {
        configurable: true,
        value: originalVisualViewport,
      })
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        value: originalMatchMedia,
      })
    }
  })

  beforeEach(() => {
    dragHandlers.clear()
    vi.restoreAllMocks()
    vi.clearAllMocks()
    dragHandlers.clear()
    localStorage.clear()
    sessionStorage.clear()
    fixtureKnowledgeBindings.clear()
    // The address now carries the selected session, so it has to be reset or
    // one test's deep link selects a session in the next.
    window.history.replaceState({}, '', '/')
    // A faithful stand-in for the hub's order: it starts empty, accepts one
    // bootstrap, and commits lane writes with a rising revision, so the tests
    // exercise the same convergence rules the real store enforces.
    hubSessionOrder = {
      revision: 0,
      bootstrapped: false,
      showSuspended: true,
      order: {},
    }
    hubSettings = { revision: 0, values: {}, keyRevisions: {} }
    vi.mocked(fetchSettingsProfile).mockImplementation(async () => hubSettingsSnapshot())
    vi.mocked(saveSettingsChanges).mockImplementation(async (changes, deviceId) => {
      const result = applySettingsChanges(
        hubSettings,
        validateSettingsChanges(changes as Record<string, unknown>),
        deviceId,
      )
      hubSettings = result.record
      return { settings: hubSettingsSnapshot(), conflicts: result.conflicts }
    })
    vi.mocked(importSettingsProfile).mockImplementation(async (values, deviceId) => {
      hubSettings = applySettingsImport(
        hubSettings,
        validateSettingsImport(values as Record<string, unknown>),
        deviceId,
      )
      return hubSettingsSnapshot()
    })
    vi.mocked(fetchSessionOrder).mockImplementation(async () =>
      structuredClone(hubSessionOrder),
    )
    vi.mocked(bootstrapSessionOrder).mockImplementation(async (order) => {
      if (!hubSessionOrder.bootstrapped) {
        hubSessionOrder = {
          revision: hubSessionOrder.revision + 1,
          bootstrapped: true,
          showSuspended: hubSessionOrder.showSuspended,
          order: { ...hubSessionOrder.order, ...structuredClone(order) },
        }
      }
      return structuredClone(hubSessionOrder)
    })
    vi.mocked(saveSessionOrderLane).mockImplementation(async (computerId, lane) => {
      hubSessionOrder = {
        revision: hubSessionOrder.revision + 1,
        bootstrapped: hubSessionOrder.bootstrapped,
        showSuspended: hubSessionOrder.showSuspended,
        order: { ...hubSessionOrder.order, [computerId]: [...lane] },
      }
      return structuredClone(hubSessionOrder)
    })
    vi.mocked(saveSessionVisibility).mockImplementation(async (showSuspended) => {
      hubSessionOrder = {
        ...hubSessionOrder,
        revision: hubSessionOrder.revision + 1,
        showSuspended,
      }
      return structuredClone(hubSessionOrder)
    })
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
    mockKnowledgeRoots([])
    vi.mocked(getSessionKnowledgeRoot).mockImplementation(async (computerId, sessionId) =>
      fixtureKnowledgeBinding(computerId, sessionId))
    vi.mocked(updateSessionKnowledgeRoot).mockImplementation(async (computerId, sessionId, input) => {
      const previous = fixtureKnowledgeBinding(computerId, sessionId)
      if (input.expectedRevision !== previous.revision) {
        throw new SessionKnowledgeRequestError('Root changed in another client', 409, previous)
      }
      const root = fixtureKnowledgeRoots.find((candidate) => candidate.id === input.rootId)
      if (input.rootId && !root) throw new Error('Fixture Knowledge root is not registered')
      const binding: SessionKnowledgeBinding = {
        computerId,
        sessionId,
        rootId: input.rootId,
        rootPath: input.rootId ? input.rootPath || '.' : '.',
        revision: previous.revision + 1,
        root, available: Boolean(root),
      }
      fixtureKnowledgeBindings.set(`${computerId}:${sessionId}`, binding)
      return binding
    })

    vi.mocked(deleteKnowledgeRoot).mockImplementation(async (id) => {
      fixtureKnowledgeRoots = fixtureKnowledgeRoots.filter((root) => root.id !== id)
    })
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
    vi.mocked(listSessionSkills).mockImplementation(async (computerId, sessionId, provider) => ({
      computerId, sessionId, provider, scope: 'session',
      capturedAt: '2026-09-05T00:00:00.000Z',
      skills: [{ name: 'review-code', description: 'Review the current code', enabled: true, source: 'project' }],
    }))
    vi.mocked(listSessionMcpServers).mockImplementation(async (computerId, sessionId, provider) => ({
      computerId, sessionId, provider, scope: 'session',
      capturedAt: '2026-09-05T00:00:00.000Z',
      servers: [{ name: 'project-tools', status: 'connected', source: 'project' }],
    }))
    vi.mocked(createSession).mockResolvedValue(session)
    vi.mocked(getRuntimeOptions).mockResolvedValue({
      current: {
        model: 'fixture-model',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: 'plan',
      },
      models: [
        {
          id: 'fixture-model',
          name: 'Fixture Model',
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
                  id: 'fixture-model',
                  name: 'Fixture Model',
                  reasoningEfforts: ['medium', 'high', 'xhigh'],
                  contextTiers: ['default', 'long_context'],
                  contextTokenLimits: {
                    default: 114_000,
                    long_context: 922_000,
                  },
                },
                {
                  id: 'fixture-fast',
                  name: 'Fast Model',
                  reasoningEfforts: ['low', 'medium'],
                  contextTiers: ['default'],
                },
              ]
            : [
                {
                  id: 'provider-model',
                  name: 'Provider Model',
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
    vi.mocked(recoverConversation).mockResolvedValue({
      ...session,
      id: 'recovered-session',
      replacedSessionIds: [session.id],
      recovery: {
        recoveredAt: '2026-09-09T00:00:00.000Z',
        archivedMessageCount: session.messages.length,
        contextMessageCount: 1,
        contextTruncated: false,
        reason: 'provider-error',
      },
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
    vi.mocked(dispatchQueuedPrompt).mockRejectedValue(
      new Error('No queued dispatch configured'),
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

  function resourceSession(overrides: Partial<ManagedSession> = {}) {
    const target: ManagedSession = { ...session, provider: 'copilot', executionMode: 'sdk', ...overrides }
    vi.mocked(listComputers).mockResolvedValue([{
      ...computer,
      providers: computer.providers?.map((provider) => ({ ...provider, supportsSessionResources: true })),
    }])
    vi.mocked(listSessions).mockResolvedValue([target, secondSession])
    vi.mocked(getSession).mockImplementation(async (_computerId, id) => id === secondSession.id ? secondSession : target)
    return target
  }

  it('badges sessions Oracle started, opens Oracle from the header, and keeps its events out of errors', async () => {
    vi.mocked(getManager).mockResolvedValue({
      available: true,
      status: 'idle',
      messages: [],
      queued: 0,
      managedSessions: [`${computer.id}:${session.id}`],
    })
    render(<App />)
    const row = await screen.findByRole('button', { name: /Project chat, started by Oracle/ })
    expect(within(row).getByText('Oracle')).toBeInTheDocument()
    // A bubble at the bottom right of the conversation, not in its header,
    // sharing a dock with Scroll to latest so neither covers the other.
    const dock = document.querySelector<HTMLElement>('.timeline-dock')!
    const oracle = await within(dock).findByRole('button', { name: 'Oracle' })
    expect(oracle).toHaveClass('oracle-bubble')
    expect(within(document.querySelector<HTMLElement>('.conversation-header')!)
      .queryByRole('button', { name: /^Oracle/ })).toBeNull()
    // The phone session list covers the conversation, so it offers Oracle too;
    // CSS shows that copy only on a phone.
    const sidebarOracle = within(document.querySelector<HTMLElement>('.sidebar-settings')!)
      .getByRole('button', { name: 'Oracle' })
    expect(sidebarOracle).toHaveClass('sidebar-settings__oracle')
    expect(sidebarOracle).toHaveAttribute('aria-controls', 'oracle-panel')
    // Focus never returns to it while the session list is closed.
    expect(sidebarOracle).toHaveAttribute('data-oracle-offscreen')
    fireEvent.click(screen.getByRole('button', { name: 'Open sessions' }))
    expect(sidebarOracle).not.toHaveAttribute('data-oracle-offscreen')
    fireEvent.click(document.querySelector<HTMLElement>('.sidebar__close')!)
    expect(sidebarOracle).toHaveAttribute('data-oracle-offscreen')
    fireEvent.click(oracle)
    expect(screen.getByRole('dialog', { name: 'Oracle' })).toBeInTheDocument()

    await act(async () => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({ type: 'manager.status', status: 'working', queued: 0 }),
      } as MessageEvent)
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({ type: 'manager.sessions', managedSessions: [] }),
      } as MessageEvent)
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(within(dock).getByRole('button', { name: 'Oracle, working' })).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Project chat, started by Oracle/ })).not.toBeInTheDocument())
  })

  it('sends /oracle to Oracle as Ask only, never to the session', async () => {
    vi.mocked(getManager).mockResolvedValue({
      available: true, status: 'idle', messages: [], queued: 0, managedSessions: [],
    })
    vi.mocked(sendManagerMessage).mockResolvedValue({
      id: 'o1', role: 'user', content: 'Which sessions finished?', createdAt: 't', state: 'queued', answerOnly: true,
    })
    render(<App />)
    await within(document.querySelector<HTMLElement>('.timeline-dock')!).findByRole('button', { name: 'Oracle' })
    fireEvent.change(await screen.findByLabelText('Message'), { target: { value: '/oracle Which sessions finished?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendManagerMessage).toHaveBeenCalledWith(
      'Which sessions finished?', expect.anything(), { answerOnly: true },
    ))
    expect(sendMessage).not.toHaveBeenCalled()
    expect(executeCommand).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: 'Oracle' })).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toHaveValue('')
  })

  it('keeps /oracle in the message bar when Oracle is off, never sending it to the session', async () => {
    vi.mocked(getManager).mockResolvedValue({
      available: false,
      unavailableReason: 'Oracle is turned off on this hub (AGENTIC_REMOTE_MANAGER=off).',
      status: 'offline', messages: [], queued: 0, managedSessions: [],
    })
    render(<App />)
    const input = await screen.findByLabelText('Message')
    await waitFor(() => expect(getManager).toHaveBeenCalled())
    await act(async () => undefined)
    fireEvent.change(input, { target: { value: '/oracle Which sessions finished?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect((await screen.findAllByText(/Oracle is turned off on this hub/)).length).toBeGreaterThan(0)
    expect(sendManagerMessage).not.toHaveBeenCalled()
    expect(sendMessage).not.toHaveBeenCalled()
    expect(executeCommand).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Message')).toHaveValue('/oracle Which sessions finished?')
  })

  it('offers Oracle where Knowledge covers the conversation header', async () => {
    vi.mocked(getManager).mockResolvedValue({
      available: true, status: 'idle', messages: [], queued: 0, managedSessions: [],
    })
    mockKnowledgeRoots([knowledgeRoot])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({
      path: '.',
      entries: [{ name: 'guide.md', path: 'guide.md', kind: 'markdown', size: 20 }],
    })
    vi.mocked(readKnowledgeFile).mockResolvedValue({
      name: 'guide.md', path: 'guide.md', kind: 'markdown', mimeType: 'text/markdown', size: 20, content: '# Guide',
    })
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    fireEvent.click(await within(tree).findByRole('treeitem', { name: /guide.md/ }))
    await screen.findByRole('heading', { name: 'Guide' })
    // CSS shows each copy only where the conversation header is out of view:
    // Knowledge's header when it covers the conversation, and the document's
    // header on a phone, where it replaces Knowledge's.
    const header = document.querySelector<HTMLElement>('.knowledge-panel__header .knowledge-panel__oracle')
    const reader = document.querySelector<HTMLElement>('.knowledge-reader .knowledge-reader__oracle')
    expect(header).toHaveAccessibleName('Oracle')
    expect(reader).toHaveAccessibleName('Oracle')
    fireEvent.click(reader!)
    expect(screen.getByRole('dialog', { name: 'Oracle' })).toBeInTheDocument()
    expect(reader).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows an actionable session-load failure and retries the snapshot', async () => {
    vi.mocked(listSessionListing)
      .mockRejectedValueOnce(
        new Error(
          'The gateway could not reach Agentic Remote (502). Check the hub service and tunnel, then retry.',
        ),
      )
      .mockResolvedValue({
        sessions: [session],
        answeredComputerIds: [computer.id],
      })

    render(<App />)

    expect(
      await screen.findByText(
        'The gateway could not reach Agentic Remote (502). Check the hub service and tunnel, then retry.',
      ),
    ).toBeVisible()
    expect(screen.queryByText('Loading sessions...')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Retry loading sessions' }))

    await screen.findAllByText('Project chat')
    expect(listSessionListing).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('button', { name: 'Retry loading sessions' })).toBeNull()
  })

  it('clears a session-load failure after a successful visibility refresh', async () => {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    vi.mocked(listSessionListing)
      .mockRejectedValueOnce(new Error('The hub is unavailable'))
      .mockResolvedValue({
        sessions: [session],
        answeredComputerIds: [computer.id],
      })

    render(<App />)
    await screen.findByText('The hub is unavailable')

    fireEvent(document, new Event('visibilitychange'))

    await screen.findAllByText('Project chat')
    await waitFor(() =>
      expect(screen.queryByText('The hub is unavailable')).not.toBeInTheDocument(),
    )
  })

  it('opens read-only skills and MCP views from the selected session menu', async () => {
    resourceSession()
    render(<App />)
    await screen.findByLabelText('Message')
    fireEvent.click(screen.getByRole('button', { name: 'Session actions' }))
    fireEvent.click(screen.getByRole('button', { name: 'View session skills' }))
    await screen.findByRole('dialog', { name: 'Skills and MCP servers' })
    await screen.findByRole('heading', { name: 'review-code' })
    fireEvent.click(screen.getByRole('tab', { name: 'MCP servers' }))
    await screen.findByRole('heading', { name: 'project-tools' })
    expect(sendMessage).not.toHaveBeenCalled()
    expect(executeCommand).not.toHaveBeenCalled()
    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Skills and MCP servers' })).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Session actions' })).toHaveFocus()
  })

  it.each([
    ['/skill', 'Open skills', 'review-code', ''],
    ['/skills review', 'Open skills', 'review-code', 'review'],
    ['/mcp project', 'Open MCP servers', 'project-tools', 'project'],
  ])('opens %s as a read-only resource view without sending or queueing a prompt', async (command, action, resource, filter) => {
    resourceSession()
    render(<App />)
    const editor = await screen.findByLabelText('Message')
    fireEvent.change(editor, { target: { value: command } })
    fireEvent.click(screen.getByRole('button', { name: action }))
    await screen.findByRole('heading', { name: resource })
    expect(screen.getByRole('searchbox', {
      name: action === 'Open skills' ? 'Filter skills' : 'Filter MCP servers',
    })).toHaveValue(filter)
    expect(editor).toHaveValue('')
    expect(sendMessage).not.toHaveBeenCalled()
    expect(executeCommand).not.toHaveBeenCalled()
    expect(dispatchQueuedPrompt).not.toHaveBeenCalled()
    expect(updateQueuedPrompt).not.toHaveBeenCalled()
  })

  it('opens the singular /skill alias with one desktop Enter', async () => {
    resourceSession()
    render(<App />)
    const editor = await screen.findByLabelText('Message')
    await waitFor(() => expect(listCommands).toHaveBeenCalled())
    fireEvent.change(editor, { target: { value: '/skill' } })
    fireEvent.keyDown(editor, { key: 'Enter', code: 'Enter' })
    await screen.findByRole('heading', { name: 'review-code' })
    expect(sendMessage).not.toHaveBeenCalled()
    expect(executeCommand).not.toHaveBeenCalled()
  })

  it('uses browser views instead of an advertised native MCP configuration command', async () => {
    resourceSession()
    vi.mocked(listCommands).mockResolvedValue([{
      name: 'mcp', description: 'Reconfigure native MCP servers', allowDuringAgentExecution: false,
    }])
    render(<App />)
    const editor = await screen.findByLabelText('Message')
    await waitFor(() => expect(listCommands).toHaveBeenCalled())
    fireEvent.change(editor, { target: { value: '/mcp' } })
    expect(screen.queryByText('Reconfigure native MCP servers')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Open MCP servers' }))
    await screen.findByRole('heading', { name: 'project-tools' })
    expect(executeCommand).not.toHaveBeenCalled()
  })

  it('allows a suspended session to inspect configured resources without resuming it', async () => {
    const target = resourceSession({ suspended: true })
    const snapshot: ManagedSessionMcpServersSnapshot = {
      computerId: target.computerId, sessionId: target.id, provider: 'copilot',
      capturedAt: '2026-09-05T00:00:00.000Z', scope: 'workspace',
      servers: [{ name: 'configured-tools', status: 'unknown', enabled: true }],
    }
    vi.mocked(listSessionMcpServers).mockResolvedValue(snapshot)
    render(<App />)
    const editor = await screen.findByLabelText('Message')
    fireEvent.change(editor, { target: { value: '/mcp' } })
    expect(screen.getByRole('button', { name: 'Open MCP servers' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'Open MCP servers' }))
    await screen.findByRole('heading', { name: 'configured-tools' })
    expect(screen.getByText('Configured for this folder')).toBeInTheDocument()
    expect(listCommands).not.toHaveBeenCalled()
    expect(resumeSession).not.toHaveBeenCalled()
    expect(sendMessage).not.toHaveBeenCalled()
    expect(executeCommand).not.toHaveBeenCalled()
  })

  it('keeps the hidden pasted draft when a history preview opens resources', async () => {
    resourceSession({ messages: [{ ...session.messages[0], content: '/skills' }] })
    render(<App />)
    const editor = await screen.findByLabelText('Message')
    const pasted = Array.from({ length: 21 }, (_, index) => `Keep line ${index}`).join('\n')
    fireEvent.paste(editor, { clipboardData: { getData: () => pasted } })
    expect(editor).toHaveValue('[Paste #1 - 21 lines]')
    fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
    expect(editor).toHaveValue('/skills')
    fireEvent.click(screen.getByRole('button', { name: 'Open skills' }))
    await screen.findByRole('heading', { name: 'review-code' })
    expect(editor).toHaveValue('[Paste #1 - 21 lines]')
    expect(sendMessage).not.toHaveBeenCalled()
    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Skills and MCP servers' })).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledWith(
      computer.id, session.id, expect.objectContaining({ content: pasted, enqueue: false }),
    ))
  })

  it('does not use a queued rewrite as a resource-view command', async () => {
    resourceSession({
      status: 'running', queuedCount: 1,
      queuedPrompts: [{ id: 'queued-resource', content: 'Queued original', createdAt: session.updatedAt }],
    })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Edit queued prompt 1' }))
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: '/mcp' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save to queue' }))
    await screen.findAllByText(/answered by this app/)
    expect(screen.queryByRole('dialog', { name: 'Skills and MCP servers' })).not.toBeInTheDocument()
    expect(listSessionMcpServers).not.toHaveBeenCalled()
    expect(updateQueuedPrompt).not.toHaveBeenCalled()
    expect(dispatchQueuedPrompt).not.toHaveBeenCalled()
    expect(executeCommand).not.toHaveBeenCalled()
  })

  it('closes resources on session navigation and ignores the old pending response', async () => {
    const target = resourceSession()
    let resolveOld: (value: ManagedSessionSkillsSnapshot) => void = () => {}
    vi.mocked(listSessionSkills).mockImplementationOnce(() =>
      new Promise((resolve) => { resolveOld = resolve }),
    )
    render(<App />)
    await screen.findByLabelText('Message')
    fireEvent.click(screen.getByRole('button', { name: 'Session actions' }))
    fireEvent.click(screen.getByRole('button', { name: 'View session skills' }))
    await waitFor(() => expect(listSessionSkills).toHaveBeenCalledOnce())
    await act(async () => {
      window.history.pushState({}, '', `/?computer=${computer.id}&session=${secondSession.id}`)
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Skills and MCP servers' })).not.toBeInTheDocument())
    await act(async () => resolveOld({
      computerId: target.computerId, sessionId: target.id, provider: 'copilot',
      scope: 'session', capturedAt: target.updatedAt, skills: [{ name: 'late-old-skill' }],
    }))
    await act(async () => {
      window.history.pushState({}, '', `/?computer=${computer.id}&session=${target.id}`)
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.queryByRole('dialog', { name: 'Skills and MCP servers' })).not.toBeInTheDocument()
    expect(screen.queryByText('late-old-skill')).not.toBeInTheDocument()
  })

  it('retires an open resource view when its computer pairing is removed', async () => {
    resourceSession()
    render(<App />)
    await screen.findByLabelText('Message')
    fireEvent.click(screen.getByRole('button', { name: 'Session actions' }))
    fireEvent.click(screen.getByRole('button', { name: 'View session MCP servers' }))
    await screen.findByRole('heading', { name: 'project-tools' })
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'computer.removed', computerId: computer.id }),
      } as MessageEvent)
    })
    expect(screen.queryByRole('dialog', { name: 'Skills and MCP servers' })).not.toBeInTheDocument()
  })

  it.each(['cwd', 'executionMode', 'suspended', 'cwd-round-trip'] as const)(
    'retires resource ownership on %s while ignoring a late response',
    async (change) => {
      const target = resourceSession()
      let resolveOld!: (value: ManagedSessionSkillsSnapshot) => void
      vi.mocked(listSessionSkills).mockImplementationOnce(() =>
        new Promise((resolve) => { resolveOld = resolve }),
      )
      render(<App />)
      await screen.findByLabelText('Message')
      fireEvent.click(screen.getByRole('button', { name: 'Session actions' }))
      fireEvent.click(screen.getByRole('button', { name: 'View session skills' }))
      await waitFor(() => expect(listSessionSkills).toHaveBeenCalledOnce())
      const signal = vi.mocked(listSessionSkills).mock.calls[0][3]
      const changed: ManagedSession = {
        ...target,
        ...(change.startsWith('cwd') ? { cwd: '/fixture/other' }
          : change === 'executionMode' ? { executionMode: 'tmux' } : { suspended: true }),
      }
      await act(async () => {
        for (const next of change === 'cwd-round-trip' ? [changed, target] : [changed]) {
          MockWebSocket.instances[0]?.onmessage?.({
            data: JSON.stringify({ type: 'session.upserted', session: next }),
          } as MessageEvent)
        }
      })
      expect(screen.queryByRole('dialog', { name: 'Skills and MCP servers' })).not.toBeInTheDocument()
      expect(signal?.aborted).toBe(true)
      await act(async () => resolveOld({
        computerId: target.computerId, sessionId: target.id, provider: 'copilot',
        scope: 'session', capturedAt: target.updatedAt, skills: [{ name: 'retired-owner-skill' }],
      }))
      expect(screen.queryByText('retired-owner-skill')).not.toBeInTheDocument()
    },
  )

  it('retires resource ownership on a same-ID re-pair but not ordinary computer updates', async () => {
    resourceSession()
    render(<App />)
    await screen.findByLabelText('Message')
    fireEvent.click(screen.getByRole('button', { name: 'Session actions' }))
    fireEvent.click(screen.getByRole('button', { name: 'View session skills' }))
    await screen.findByRole('heading', { name: 'review-code' })
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'computer.updated', computer: { ...computer, name: 'Renamed computer' } }),
      } as MessageEvent)
    })
    expect(screen.getByRole('dialog', { name: 'Skills and MCP servers' })).toBeInTheDocument()
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'computer.updated', computer: { ...computer, registrationId: 'new-pairing' } }),
      } as MessageEvent)
    })
    expect(screen.queryByRole('dialog', { name: 'Skills and MCP servers' })).not.toBeInTheDocument()
  })

  it.each(['skills', 'mcp'] as const)('closes the retired %s resource modal on committed-clear websocket events despite a cleanup warning', async (kind) => {
    const target = resourceSession()
    const replacement = { ...target, id: 'committed-replacement', replacedSessionIds: [target.id], messages: [] }
    let resolveOld!: (value: ManagedSessionSkillsSnapshot | ManagedSessionMcpServersSnapshot) => void
    const pending = new Promise<ManagedSessionSkillsSnapshot | ManagedSessionMcpServersSnapshot>((resolve) => { resolveOld = resolve })
    if (kind === 'skills') vi.mocked(listSessionSkills).mockReturnValueOnce(pending as Promise<ManagedSessionSkillsSnapshot>)
    else vi.mocked(listSessionMcpServers).mockReturnValueOnce(pending as Promise<ManagedSessionMcpServersSnapshot>)
    render(<App />)
    await screen.findByLabelText('Message')
    fireEvent.click(screen.getByRole('button', { name: 'Session actions' }))
    fireEvent.click(screen.getByRole('button', { name: kind === 'skills' ? 'View session skills' : 'View session MCP servers' }))
    const call = kind === 'skills' ? vi.mocked(listSessionSkills) : vi.mocked(listSessionMcpServers)
    await waitFor(() => expect(call).toHaveBeenCalledOnce())
    const signal = call.mock.calls[0][3]
    vi.mocked(getSession).mockResolvedValue(replacement)
    await act(async () => {
      for (const event of [
        { type: 'session.removed', computerId: target.computerId, sessionId: target.id, replacedBy: replacement.id },
        { type: 'session.upserted', session: replacement },
        { type: 'error', computerId: target.computerId, sessionId: replacement.id, message: 'Conversation cleared, but previous uploads could not be removed.' },
      ]) MockWebSocket.instances[0]?.onmessage?.({ data: JSON.stringify(event) } as MessageEvent)
    })
    expect(screen.queryByRole('dialog', { name: 'Skills and MCP servers' })).not.toBeInTheDocument()
    expect(signal?.aborted).toBe(true)
    await act(async () => resolveOld({
      computerId: target.computerId, sessionId: target.id, provider: 'copilot',
      scope: 'session', capturedAt: target.updatedAt,
      ...(kind === 'skills' ? { skills: [{ name: 'retired-resource' }] } : { servers: [{ name: 'retired-resource', status: 'connected' }] }),
    } as ManagedSessionSkillsSnapshot | ManagedSessionMcpServersSnapshot))
    expect(screen.queryByText('retired-resource')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Skills and MCP servers' })).not.toBeInTheDocument()
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
          content: 'Skill (service-inventory)',
          createdAt: '2026-07-22T00:00:00.000Z',
          activityStatus: 'completed',
          activityKind: 'skill',
        },
        {
          id: 'mcp-call',
          role: 'activity',
          content: 'MCP · configuration-service · search_config_keys',
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

    expect(screen.getByText('skill(service-inventory)')).toBeInTheDocument()
    expect(screen.getByText('search_config_keys')).toBeInTheDocument()
    expect(screen.getByText('(MCP: configuration-service)')).toBeInTheDocument()
    expect(screen.getByText('48 lines read')).toBeInTheDocument()
    expect(screen.getByText('1.3s')).toBeInTheDocument()
    expect(screen.getByText('Error: file not found')).toBeInTheDocument()
    expect(screen.getByText('cache')).toBeInTheDocument()
    expect(document.querySelectorAll('.activity-message')).toHaveLength(4)
    expect(document.querySelector('.activity-group__children')).toHaveTextContent(
      'search_config_keys',
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
          content: 'Skill (service-inventory)',
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
    ).toEqual(['skill(service-inventory)', 'Read', 'Search Repositories'])
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
    expect(
      screen.queryByRole('button', { name: 'Add knowledge root' }),
    ).not.toBeInTheDocument()
  })

  it('persists the sidebar width from the final pointer position', async () => {
    localStorage.removeItem('agentic-remote:sidebar-width')
    render(<App />)
    const resizer = await screen.findByRole('separator', {
      name: 'Resize sidebar',
    })
    const initialWidth = Number(resizer.getAttribute('aria-valuenow'))
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

    expect(localStorage.getItem('agentic-remote:sidebar-width')).toBe(String(initialWidth + 80))
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

    fireEvent.change(textarea, { target: { value: 'Unsent walking notes' } })
    fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
    expect(textarea).toHaveValue('Second prompt')

    // A programmatic append belongs to the hidden draft, not the preview.
    const file = new File(['audio'], 'idea.webm', { type: 'audio/webm' })
    fireEvent.drop(textarea.closest('.composer')!, {
      dataTransfer: { files: [file], types: ['Files'] },
    })
    await waitFor(() =>
      expect(textarea).toHaveValue('Unsent walking notes\n\nTranscribed walking idea'),
    )

    // Navigating again must not discard the dictated text.
    fireEvent.keyDown(textarea, { key: 'ArrowUp' })
    expect(textarea).toHaveValue('Unsent walking notes\n\nTranscribed walking idea')
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

  it('groups app settings by what they are about', async () => {
    vi.mocked(getManager).mockResolvedValue({
      available: true, status: 'idle', messages: [], queued: 0, managedSessions: [], settings: {},
    })
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
    const dialog = screen.getByRole('dialog', { name: 'App settings' })
    const groups = [...dialog.querySelectorAll<HTMLElement>('.app-settings-group')]
    expect(groups.map((group) => group.querySelector('h3')?.textContent)).toEqual([
      'Models', 'Folders', 'Notifications', 'Interface', 'App',
    ])
    const [models, folders, notifications, ui, app] = groups
    // Every model choice in one place: new sessions', then Oracle's.
    expect(within(models).getByRole('heading', { name: 'New sessions' })).toBeInTheDocument()
    expect(await within(models).findByLabelText('GitHub Copilot default model')).toBeInTheDocument()
    expect(await within(models).findByRole('combobox', { name: 'Oracle model' })).toBeInTheDocument()
    // Every folder in one place, per computer: yours, then Oracle's.
    const computerFolders = within(folders).getByRole('group', { name: 'Session folders on development' })
    expect(within(computerFolders).getByRole('button', { name: 'Browse default session folder for development' })).toBeInTheDocument()
    expect(await within(computerFolders).findByRole('button', { name: "Browse Oracle's session folder for development" }))
      .toBeInTheDocument()
    expect(within(computerFolders).getByText('Same as new sessions')).toBeInTheDocument()
    expect(within(notifications).getByRole('heading', { name: 'Notifications' })).toBeInTheDocument()
    for (const name of ['Appearance', 'Status line', 'Keyboard shortcuts']) {
      expect(within(ui).getByRole('heading', { name })).toBeInTheDocument()
    }
    expect(within(app).getByRole('heading', { name: 'App updates' })).toBeInTheDocument()

    // A jump bar reaches each group.
    const jump = within(dialog).getByRole('navigation', { name: 'Settings sections' })
    expect(within(jump).getAllByRole('button').map((button) => button.textContent)).toEqual([
      'Models', 'Folders', 'Notifications', 'Interface', 'App',
    ])
    // It scrolls the settings alone, placing the group under the jump bar;
    // never the page behind the dialog.
    const scrollTo = vi.fn()
    Object.defineProperty(dialog, 'scrollTo', { configurable: true, value: scrollTo })
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({ top: 100 } as DOMRect)
    vi.spyOn(folders, 'getBoundingClientRect').mockReturnValue({ top: 700 } as DOMRect)
    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView)
    scrollIntoView.mockClear()
    fireEvent.click(within(jump).getByRole('button', { name: 'Folders' }))
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 592 })
    expect(scrollIntoView).not.toHaveBeenCalled()
    // It takes the focus there too, and Tab carries on into that group.
    const foldersHeading = within(folders).getByRole('heading', { name: 'Folders' })
    expect(foldersHeading).toHaveFocus()
    const width = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100)
    try {
      fireEvent.keyDown(document, { key: 'Tab' })
      expect(within(computerFolders).getByRole('button', { name: 'Browse default session folder for development' }))
        .toHaveFocus()
      foldersHeading.focus()
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
      expect(models.contains(document.activeElement)).toBe(true)
    } finally {
      width.mockRestore()
    }
  })

  it("opens app settings at Oracle's model from Oracle's panel", async () => {
    vi.mocked(getManager).mockResolvedValue({
      available: true, status: 'idle', messages: [], queued: 0, managedSessions: [], settings: {},
    })
    // Catches the observer that keeps Oracle in place while the settings load.
    const watched: { target: Element; callback: ResizeObserverCallback; on: boolean }[] = []
    vi.stubGlobal('ResizeObserver', class {
      private entry?: (typeof watched)[number]
      private readonly callback: ResizeObserverCallback
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
      }
      observe(target: Element) {
        this.entry = { target, callback: this.callback, on: true }
        watched.push(this.entry)
      }
      unobserve() {}
      disconnect() {
        if (this.entry) this.entry.on = false
      }
    })
    const settingsGrow = () => {
      for (const entry of watched) {
        if (entry.on && entry.target.matches('.app-settings-dialog__sections')) {
          entry.callback([], {} as ResizeObserver)
        }
      }
    }
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(await within(document.querySelector<HTMLElement>('.timeline-dock')!).findByRole('button', { name: 'Oracle' }))
    const scrollTo = vi.fn()
    const scrollToBefore = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTo')
    Object.defineProperty(Element.prototype, 'scrollTo', { configurable: true, value: scrollTo })
    let oracleTop = 400
    const rect = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      const top = this.id === 'settings-oracle' ? oracleTop : this.classList.contains('app-settings-dialog') ? 100 : 0
      return { top } as DOMRect
    })
    try {
      fireEvent.click(await screen.findByRole('button', { name: /^Oracle model:/ }))
      const dialog = await screen.findByRole('dialog', { name: 'App settings' })
      await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ top: 292 }))
      expect(scrollTo.mock.contexts.at(-1)).toBe(dialog)
      expect(within(dialog).getByRole('heading', { name: 'Oracle' })).toHaveFocus()
      // Catalogs loading above it push it down; it follows.
      oracleTop = 600
      settingsGrow()
      expect(scrollTo).toHaveBeenLastCalledWith({ top: 492 })
      // Once you scroll yourself, it stays where you put it.
      scrollTo.mockClear()
      fireEvent.wheel(dialog)
      oracleTop = 800
      settingsGrow()
      expect(scrollTo).not.toHaveBeenCalled()
      // Opened from the sessions panel, it starts at the top.
      fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
      fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
      await screen.findByRole('dialog', { name: 'App settings' })
      await new Promise((resolve) => requestAnimationFrame(resolve))
      settingsGrow()
      expect(scrollTo).not.toHaveBeenCalled()
    } finally {
      rect.mockRestore()
      vi.unstubAllGlobals()
      if (scrollToBefore) Object.defineProperty(Element.prototype, 'scrollTo', scrollToBefore)
      else Reflect.deleteProperty(Element.prototype, 'scrollTo')
    }
  })

  it('keeps the fixed Relay icon whichever accent is chosen', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    const shell = document.querySelector('.app-shell')
    expect(shell).toHaveAttribute('data-accent-theme', 'agentic')
    const icon = () =>
      document.querySelector('.brand__mark')?.getAttribute('src') || ''
    expect(icon()).toBe('/icon.svg')
    expect(document.querySelector('.brand__mark')?.tagName).toBe('IMG')
    expect(document.querySelector('.brand__mark')).toHaveAttribute('src', icon())
    expect(document.querySelector('.brand__mark')).toHaveAttribute('alt', '')
    const initialIcon = icon()
    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Violet accent' }))

    expect(shell).toHaveAttribute('data-accent-theme', 'violet')
    expect(savedSetting('accent')).toBe('violet')
    expect(sessionStorage.getItem('agentic-remote:accent-theme')).toBeNull()
    expect(icon()).toBe(initialIcon)
    expect(document.querySelector('.brand__mark')).toHaveAttribute('src', icon())
    fireEvent.click(screen.getByRole('radio', { name: 'Teal accent' }))
    expect(icon()).toBe(initialIcon)
    expect(document.querySelector('.brand__mark')).toHaveAttribute('src', icon())
  })

  it('restores the tab accent without changing the fixed Relay icon', async () => {
    sessionStorage.setItem('agentic-remote:accent-theme', 'rose')
    render(<App />)
    await screen.findAllByText('Project chat')

    expect(document.querySelector('.app-shell')).toHaveAttribute(
      'data-accent-theme',
      'rose',
    )
    expect(document.querySelector('.brand__mark')).toHaveAttribute(
      'src',
      '/icon.svg',
    )
  })

  it('ignores an unknown stored accent', async () => {
    sessionStorage.setItem('agentic-remote:accent-theme', 'infrared')

    render(<App />)
    await screen.findAllByText('Project chat')

    expect(document.querySelector('.app-shell')).toHaveAttribute(
      'data-accent-theme',
      'agentic',
    )
    expect(document.querySelector('.brand__mark')).toHaveAttribute(
      'src',
      '/icon.svg',
    )
  })

  it('ignores legacy icon preferences and omits icon settings', async () => {
    localStorage.setItem(
      'agentic-remote:app-icon',
      JSON.stringify({ style: 'atlas', color: 'teal' }),
    )
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))

    expect(screen.queryByRole('radio', { name: /app icon/i }))
      .not.toBeInTheDocument()
    expect(document.querySelector('.brand__mark')).toHaveAttribute(
      'src',
      '/icon.svg',
    )
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

  it('persists a default agent mode per provider and starts new sessions in it', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
    const copilotMode = await screen.findByLabelText('GitHub Copilot default agent mode')
    expect(copilotMode).toHaveValue('')
    expect([...copilotMode.querySelectorAll('option')].map((option) => option.textContent))
      .toEqual(['Interactive', 'Plan', 'Autopilot'])
    const claudeMode = screen.getByLabelText('Claude Agent default agent mode')
    expect([...claudeMode.querySelectorAll('option')].map((option) => option.textContent))
      .toEqual(['Interactive', 'Plan', 'Auto'])
    fireEvent.change(copilotMode, { target: { value: 'autopilot' } })
    fireEvent.change(claudeMode, { target: { value: 'plan' } })
    await screen.findByLabelText('GitHub Copilot default model')
    fireEvent.change(screen.getByLabelText('GitHub Copilot default model'), {
      target: { value: 'fixture-model' },
    })
    fireEvent.change(screen.getByLabelText('GitHub Copilot default model'), {
      target: { value: '' },
    })
    expect(screen.getByLabelText('GitHub Copilot default agent mode')).toHaveValue('autopilot')
    expect(
      (savedSetting('newSessionRuntimes') ?? {}),
    ).toMatchObject({ copilot: { model: '', mode: 'autopilot' }, claude: { mode: 'plan' } })
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    expect(screen.getByText(/New sessions start in/)).toHaveTextContent(
      'New sessions start in Autopilot mode.',
    )
    const createButton = screen.getByRole('button', { name: 'Create session' })
    await waitFor(() => expect(createButton).toBeEnabled())
    fireEvent.click(createButton)
    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith('computer-1', {
        cwd: '~',
        provider: 'copilot',
        terminalBacked: true,
        allowAllPermissions: true,
        mode: 'autopilot',
      }),
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.change(screen.getByLabelText('Agent provider'), {
      target: { value: 'claude' },
    })
    expect(screen.getByText(/New sessions start in/)).toHaveTextContent(
      'New sessions start in Plan mode.',
    )
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create session' })).toBeEnabled(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await waitFor(() =>
      expect(createSession).toHaveBeenLastCalledWith('computer-1', expect.objectContaining({
        provider: 'claude',
        mode: 'plan',
      })),
    )
  })

  it('ignores an unknown stored default agent mode', async () => {
    localStorage.setItem('agentic-remote:default-models', JSON.stringify({
      copilot: { model: '', reasoningEffort: '', contextTier: 'default', mode: 'shell' },
    }))
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
    expect(await screen.findByLabelText('GitHub Copilot default agent mode')).toHaveValue('')
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    expect(screen.queryByText(/New sessions start in/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await waitFor(() => expect(createSession).toHaveBeenCalled())
    expect(vi.mocked(createSession).mock.calls.at(-1)?.[1]).not.toHaveProperty('mode')
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
      target: { value: 'fixture-model' },
    })
    fireEvent.change(screen.getByLabelText('Claude Agent default model'), {
      target: { value: 'provider-model' },
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
      (savedSetting('newSessionRuntimes') ?? {}),
    ).toEqual({
      copilot: {
        model: 'fixture-model',
        reasoningEffort: 'xhigh',
        contextTier: 'long_context',
        mode: '',
      },
      claude: {
        model: 'provider-model',
        reasoningEffort: 'low',
        contextTier: 'default',
        mode: '',
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
        model: 'fixture-model',
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
        model: 'provider-model',
        reasoningEffort: 'low',
        contextTier: 'default',
      }),
    )
  })

  it('refreshes both provider catalogs every time app settings is reopened', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
    const copilot = await screen.findByLabelText('GitHub Copilot default model')
    await waitFor(() => expect(copilot).toBeEnabled())
    expect(getProviderRuntimeOptions).toHaveBeenCalledTimes(2)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    vi.mocked(getProviderRuntimeOptions).mockImplementation(
      async (_computerId, provider) => ({
        models: [{
          id: `${provider}-new-model`,
          name: `New ${provider} model`,
          reasoningEfforts: [],
          contextTiers: ['default'],
        }],
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
    const reopenedCopilot = await screen.findByLabelText('GitHub Copilot default model')
    expect(
      await within(reopenedCopilot).findByRole('option', { name: 'New copilot model' }),
    ).toBeInTheDocument()
    expect(
      within(screen.getByLabelText('Claude Agent default model')).getByRole('option', {
        name: 'New claude model',
      }),
    ).toBeInTheDocument()
    expect(getProviderRuntimeOptions).toHaveBeenCalledTimes(4)
    expect(screen.getByLabelText('GitHub Copilot default model')).toHaveValue('')
    expect(screen.getByLabelText('Claude Agent default model')).toHaveValue('')
    expect(configureRuntime).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    vi.mocked(getProviderRuntimeOptions).mockRejectedValue(
      new Error('Catalog refresh failed'),
    )
    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))
    expect(await screen.findAllByText('Catalog refresh failed')).toHaveLength(2)
    expect(screen.queryByRole('option', { name: 'New copilot model' })).toBeNull()
    expect(screen.queryByRole('option', { name: 'New claude model' })).toBeNull()
    expect(getProviderRuntimeOptions).toHaveBeenCalledTimes(6)
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
    // Opening settings chooses nothing: provider defaults stay unset everywhere.
    await waitFor(() => expect(getProviderRuntimeOptions).toHaveBeenCalled())
    expect(savedSetting('newSessionRuntimes')).toBeUndefined()
    expect(saveSettingsChanges).not.toHaveBeenCalled()

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
                  id: 'provider-model',
                  name: 'Provider Model',
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
    expect(within(model).getByRole('option', { name: 'Hub Model' })).toBeInTheDocument()
    expect(within(model).getByRole('option', { name: 'Node Model' })).toBeInTheDocument()
    // Oracle runs on the hub, so it offers only the hub's own models.
    const oracleModel = await screen.findByRole('combobox', { name: 'Oracle model' })
    await waitFor(() =>
      expect(within(oracleModel).getByRole('option', { name: 'Hub Model' })).toBeInTheDocument(),
    )
    expect(within(oracleModel).queryByRole('option', { name: 'Node Model' })).toBeNull()
    expect(getProviderRuntimeOptions).toHaveBeenCalledWith(
      secondComputer.id,
      'copilot',
    )
    expect(
      (savedSetting('newSessionRuntimes') ?? {}),
    ).toEqual({
      copilot: {
        model: 'node-model',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: '',
      },
      claude: {
        model: '',
        reasoningEffort: '',
        contextTier: 'default',
        mode: '',
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
      (savedSetting('newSessionRuntimes') ?? {}),
    ).toEqual({
      copilot: {
        model: 'node-model',
        reasoningEffort: 'high',
        contextTier: 'long_context',
        mode: '',
      },
      claude: {
        model: 'node-claude-model',
        reasoningEffort: 'high',
        contextTier: 'default',
        mode: '',
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
      (savedSetting('newSessionRuntimes') ?? {})
        .claude,
    ).toEqual({
      model: 'node-claude-model',
      reasoningEffort: 'high',
      contextTier: 'default',
      mode: '',
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
          model: 'provider-model',
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
        model: 'fixture-model',
        reasoningEffort: 'medium',
        contextTier: 'long_context',
      }),
    )
    expect(
      (savedSetting('newSessionRuntimes') ?? {}),
    ).toEqual({
      copilot: {
        model: 'removed-model',
        reasoningEffort: 'max',
        contextTier: 'long_context',
        mode: '',
      },
      claude: {
        model: 'provider-model',
        reasoningEffort: 'max',
        contextTier: 'long_context',
        mode: '',
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
        { version: 1, folders: savedSetting('newSessionFolders') ?? {} },
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
      { version: 1, folders: savedSetting('newSessionFolders') ?? {} },
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
      screen.getByText('An Agentic Remote update is ready.'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss update' }))
    expect(
      screen.queryByText('An Agentic Remote update is ready.'),
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

  it('collapses a long paste while sending its full text in place', async () => {
    const pasted = Array.from(
      { length: 21 },
      (_, index) => `pasted line ${index + 1}`,
    ).join('\n')
    render(<App />)
    const textarea = (await screen.findByLabelText(
      'Message',
    )) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Before  after' } })
    textarea.setSelectionRange(7, 7)

    fireEvent.paste(textarea, {
      clipboardData: {
        getData: (type: string) => (type === 'text/plain' ? pasted : ''),
      },
    })

    expect(textarea).toHaveValue('Before [Paste #1 - 21 lines] after')
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        content: `Before ${pasted} after`,
        enqueue: false,
      }),
    )
  })

  it('migrates a persisted legacy paste before removing its old payload key', async () => {
    const label = '[Paste #1 - 21 lines]'
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join(
      '\n',
    )
    localStorage.setItem(
      'agentic-remote:composer-drafts',
      JSON.stringify({ 'computer-1:session-1': label }),
    )
    localStorage.setItem(
      'agentic-remote:composer-pastes',
      JSON.stringify({
        'computer-1:session-1': [
          { id: 1, content: pasted, lineCount: 21 },
        ],
      }),
    )

    render(<App />)

    expect(await screen.findByLabelText('Message')).toHaveValue(label)
    await waitFor(() =>
      expect(localStorage.getItem('agentic-remote:composer-pastes')).toBeNull(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        content: pasted,
        enqueue: false,
      }),
    )
  })

  it('keeps migrated paste identities distinct between sessions', async () => {
    const label = '[Paste #1 - 21 lines]'
    const first = Array.from({ length: 21 }, (_, index) => `first ${index}`).join(
      '\n',
    )
    const second = Array.from(
      { length: 21 },
      (_, index) => `second ${index}`,
    ).join('\n')
    localStorage.setItem(
      'agentic-remote:composer-drafts',
      JSON.stringify({
        'computer-1:session-1': label,
        'computer-1:session-2': label,
      }),
    )
    localStorage.setItem(
      'agentic-remote:composer-pastes',
      JSON.stringify({
        'computer-1:session-1': [
          { id: 1, content: first, lineCount: 21 },
        ],
        'computer-1:session-2': [
          { id: 1, content: second, lineCount: 21 },
        ],
      }),
    )
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
      sessionId === secondSession.id ? secondSession : session,
    )
    render(<App />)
    await screen.findByLabelText('Message')

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        content: first,
        enqueue: false,
      }),
    )
    const stored = JSON.parse(
      localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}',
    )
    expect(stored['computer-1:session-2'].pastes).toEqual([
      expect.objectContaining({ content: second }),
    ])
  })

  it('answers a command written with a space in front of it', async () => {
    // What the message is was read from the trimmed text while its arguments
    // were sliced from the raw text, so a leading space shifted every
    // argument by one and `  /statusline off` opened the dialog instead.
    render(<App />)
    const textarea = (await screen.findByLabelText(
      'Message',
    )) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: '  /statusline off' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue(''),
    )
    // Answered here, so nothing was sent, and no dialog was opened for it.
    expect(sendMessage).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('lets an older build clear a draft for good', async () => {
    // The older build writes its map in full every time, so a session it
    // holds nothing for is one whose draft was sent or cleared over there.
    // Keeping this build's copy brought that draft back from the dead -- and
    // an already-sent prompt was offered again.
    localStorage.setItem('agentic-remote:composer-drafts-generation', '1')
    localStorage.setItem(
      'agentic-remote:composer-drafts-v2',
      JSON.stringify({
        'computer-1:session-1': { text: 'what this build last saw', pastes: [] },
      }),
    )
    localStorage.setItem('agentic-remote:composer-drafts', JSON.stringify({}))

    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(''))
  })

  it('keeps a draft written against an older build after upgrading again', async () => {
    // An older build writes only the legacy key. Coming back to this one, any
    // state at all in the newer key won, and the persistence effect then wrote
    // that stale copy straight back over what had just been written.
    localStorage.setItem(
      'agentic-remote:composer-drafts-v2',
      JSON.stringify({
        'computer-1:session-1': { text: 'what this build last saw', pastes: [] },
      }),
    )
    localStorage.setItem(
      'agentic-remote:composer-drafts',
      JSON.stringify({
        'computer-1:session-1': 'written against the older build',
      }),
    )

    render(<App />)
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue(
        'written against the older build',
      ),
    )
  })

  it('keeps what was typed around a collapsed paste', async () => {
    // Indentation before a paste and a newline after it are part of the
    // message. Trimming the ends of the reconstructed prompt quietly rewrote
    // what the reader had written.
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join(
      '\n',
    )
    render(<App />)
    const textarea = (await screen.findByLabelText(
      'Message',
    )) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: '  before ' } })
    textarea.setSelectionRange(9, 9)
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => pasted },
    })
    fireEvent.change(textarea, {
      target: { value: `${textarea.value} after \n` },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        acknowledgesFailure: undefined,
        content: `  before ${pasted} after \n`,
        enqueue: false,
      }),
    )
  })

  it('sends a pasted command as a command', async () => {
    // The composer shows a placeholder for a long paste, so reading the
    // display to decide what was typed meant a pasted command was never
    // recognised as one and went to the model as ordinary words.
    const pasted = ['/clear', ...Array.from({ length: 21 }, (_, i) => `line ${i}`)].join(
      '\n',
    )
    render(<App />)
    const textarea = (await screen.findByLabelText(
      'Message',
    )) as HTMLTextAreaElement
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => pasted },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    // Recognised from the text that is actually sent.
    await waitFor(() => expect(sendMessage).not.toHaveBeenCalled())
  })

  it('leaves a short paste to the textarea', async () => {
    // Taking every paste over meant rebuilding the value by hand, which
    // throws away the undo history the browser keeps for a paste it performed
    // itself.
    render(<App />)
    const textarea = (await screen.findByLabelText(
      'Message',
    )) as HTMLTextAreaElement
    const short = ['one', 'two', 'three'].join('\n')
    const event = createEvent.paste(textarea, {
      clipboardData: { getData: () => short },
    })
    fireEvent(textarea, event)

    expect(event.defaultPrevented).toBe(false)
  })

  it('writes long pastes out in full for an older build to read', async () => {
    // The key an older build reads knows nothing of placeholders. Given the
    // display text it would show the labels as though the reader had typed
    // them, and the pasted text would be gone.
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join(
      '\n',
    )
    render(<App />)
    const textarea = (await screen.findByLabelText(
      'Message',
    )) as HTMLTextAreaElement
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => pasted },
    })

    await waitFor(() => {
      const legacy = JSON.parse(
        localStorage.getItem('agentic-remote:composer-drafts') || '{}',
      )
      expect(legacy['computer-1:session-1']).toContain('line 20')
    })
  })

  it('does not expand a copy of a paste label the reader pasted themselves', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join(
      '\n',
    )
    const label = '[Paste #1 - 21 lines]'
    render(<App />)
    const textarea = (await screen.findByLabelText(
      'Message',
    )) as HTMLTextAreaElement
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => pasted },
    })
    // A short paste is left to the textarea, which performs it itself and so
    // keeps its own undo history. jsdom does not perform it, so what a browser
    // would have written is written here instead.
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => `\n${label}` },
    })
    fireEvent.change(textarea, {
      target: { value: `${textarea.value}\n${label}` },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    // The tracked one is written out; the copy of its label is just text.
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        acknowledgesFailure: undefined,
        content: `${pasted}\n${label}`,
        enqueue: false,
      }),
    )
  })

  it('keeps paste metadata when typed text matches its boundary', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join(
      '\n',
    )
    const label = '[Paste #1 - 21 lines]'
    render(<App />)
    const textarea = (await screen.findByLabelText(
      'Message',
    )) as HTMLTextAreaElement
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => pasted },
    })
    textarea.setSelectionRange(0, 0)
    fireEvent.keyDown(textarea, { key: '[' })
    fireEvent.change(textarea, { target: { value: `[${label}` } })

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        content: `[${pasted}`,
        enqueue: false,
      }),
    )
  })

  it('preserves whitespace at the boundary of a pasted payload', async () => {
    const pasted = `\n${Array.from(
      { length: 20 },
      (_, index) => `line ${index}`,
    ).join('\n')}\nlast line  \n`
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => pasted },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        content: pasted,
        enqueue: false,
      }),
    )
  })

  it('does not attach draft paste metadata to recalled history', async () => {
    const label = '[Paste #1 - 21 lines]'
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join(
      '\n',
    )
    const historicalLabel = {
      ...session,
      messages: [
        ...session.messages,
        {
          id: 'literal-label',
          role: 'user' as const,
          content: label,
          createdAt: '2026-09-04T00:00:00.000Z',
        },
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([historicalLabel])
    vi.mocked(getSession).mockResolvedValue(historicalLabel)
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => pasted },
    })

    fireEvent.keyDown(document.querySelector('.app-shell')!, {
      key: 'ArrowUp',
    })
    expect(textarea).toHaveValue(label)
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        content: label,
        enqueue: false,
      }),
    )
  })

  it.each(
    [
      'agentic-remote:composer-drafts-generation',
      'agentic-remote:composer-drafts-v2',
      'agentic-remote:composer-drafts',
    ].flatMap((key) =>
      ['QuotaExceededError', 'SecurityError'].map((name) => [key, name]),
    ),
  )('rejects composer admission when %s throws %s', async (key, name) => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join('\r\n')
    const running = { ...session, status: 'running' as const }
    const enqueue = name === 'SecurityError'
    vi.mocked(listSessions).mockResolvedValue([running])
    vi.mocked(getSession).mockResolvedValue(running)
    const rendered = render(<App />)
    const textarea = (await screen.findByLabelText('Message')) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Before  after' } })
    textarea.setSelectionRange(7, 7)
    fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
    const display = 'Before [Paste #1 - 21 lines] after'
    expect(textarea).toHaveValue(display)

    const setItem = Storage.prototype.setItem
    let blocked = true
    const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      function (this: Storage, storageKey, value) {
        if (this === localStorage && blocked && storageKey === key) {
          throw new DOMException('Draft storage unavailable', name)
        }
        setItem.call(this, storageKey, value)
      },
    )
    try {
      fireEvent.click(screen.getByRole('button', {
        name: enqueue ? 'Queue message' : 'Send message',
      }))
      await screen.findByText(/Message was not sent/)
      expect(sendMessage).not.toHaveBeenCalled()
      expect(executeCommand).not.toHaveBeenCalled()
      expect(textarea).toHaveValue(display)
      expect(textarea).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Queue message' })).toBeEnabled()
      expect(JSON.parse(
        localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}',
      )['computer-1:session-1']?.pendingSubmission).toBeUndefined()

      fireEvent.change(textarea, { target: { value: `${display} edited` } })
      expect(textarea).toHaveValue(`${display} edited`)
      expect(screen.getByText(/could not be saved/)).toBeInTheDocument()
      expect(sendMessage).not.toHaveBeenCalled()
      blocked = false
      vi.mocked(sendMessage).mockImplementationOnce(async () => {
        expect(localStorage.getItem('agentic-remote:composer-drafts-generation')).toBe('1')
        const pending = JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}',
        )['computer-1:session-1'].pendingSubmission
        expect(pending.text).toBe(`${display} edited`)
        expect(pending.pastes[0].content).toBe(pasted)
        expect(JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts') || '{}',
        )['computer-1:session-1']).toBe(`Before ${pasted} after edited`)
        return running
      })
      fireEvent.click(screen.getByRole('button', {
        name: enqueue ? 'Queue message' : 'Send message',
      }))
      await waitFor(() =>
        expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
          content: `Before ${pasted} after edited`,
          enqueue,
        }),
      )
      await waitFor(() => expect(textarea).toHaveValue(''))
      expect(screen.queryByText(/could not be saved/)).not.toBeInTheDocument()
      rendered.unmount()
      render(<App />)
      expect(await screen.findByLabelText('Message')).toHaveValue('')
      expect(screen.queryByText(/Delivery could not be confirmed/)).not.toBeInTheDocument()
    } finally {
      storage.mockRestore()
    }
  })

  it.each(['QuotaExceededError', 'SecurityError'])(
    'keeps composer typing and paste metadata editable when storage throws %s',
    async (name) => {
      const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join('\n')
      const rendered = render(<App />)
      const textarea = (await screen.findByLabelText('Message')) as HTMLTextAreaElement
      const setItem = Storage.prototype.setItem
      let blocked = true
      const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
        function (this: Storage, key, value) {
          if (this === localStorage && blocked) {
            throw new DOMException('Draft storage unavailable', name)
          }
          setItem.call(this, key, value)
        },
      )
      try {
        fireEvent.change(textarea, { target: { value: 'Keep writing ' } })
        expect(textarea).toHaveValue('Keep writing ')
        expect(screen.getByText(/could not be saved/)).toBeInTheDocument()
        textarea.setSelectionRange(textarea.value.length, textarea.value.length)
        fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
        fireEvent.change(textarea, {
          target: { value: 'Keep writing [Paste #1 - 21 lines] edited' },
        })
        expect(textarea).toHaveValue('Keep writing [Paste #1 - 21 lines] edited')
        expect(textarea).toBeEnabled()
        expect(sendMessage).not.toHaveBeenCalled()

        blocked = false
        fireEvent.change(textarea, {
          target: { value: 'Keep writing [Paste #1 - 21 lines] edited again' },
        })
        expect(screen.queryByText(/could not be saved/)).not.toBeInTheDocument()
        rendered.unmount()
        render(<App />)
        expect(await screen.findByLabelText('Message')).toHaveValue(
          'Keep writing [Paste #1 - 21 lines] edited again',
        )
        fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
        await waitFor(() =>
          expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
            content: `Keep writing ${pasted} edited again`,
            enqueue: false,
          }),
        )
      } finally {
        storage.mockRestore()
      }
    },
  )

  it('keeps composer history and rejects admission even when partial storage rollback succeeds', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join('\n')
    const rendered = render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
    fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
    expect(textarea).toHaveValue('Hello agent')
    const before = [
      'agentic-remote:composer-drafts-generation',
      'agentic-remote:composer-drafts-v2',
      'agentic-remote:composer-drafts',
    ].map((key) => [key, localStorage.getItem(key)] as const)
    const setItem = Storage.prototype.setItem
    let failOnce = true
    const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      function (this: Storage, key, value) {
        if (this === localStorage && failOnce && key === 'agentic-remote:composer-drafts') {
          failOnce = false
          throw new DOMException('Full storage', 'QuotaExceededError')
        }
        setItem.call(this, key, value)
      },
    )
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await screen.findByText(/Message was not sent/)
      expect(sendMessage).not.toHaveBeenCalled()
      expect(textarea).toHaveValue('Hello agent')
      for (const [key, value] of before) {
        expect(localStorage.getItem(key)).toBe(value)
      }
      fireEvent.keyDown(textarea, { key: 'ArrowDown' })
      expect(textarea).toHaveValue('[Paste #1 - 21 lines]')
      rendered.unmount()
      render(<App />)
      expect(await screen.findByLabelText('Message')).toHaveValue('[Paste #1 - 21 lines]')
      expect(screen.queryByText(/Delivery could not be confirmed/)).not.toBeInTheDocument()
      expect(sendMessage).not.toHaveBeenCalled()
    } finally {
      storage.mockRestore()
    }
  })

  it('releases the failed-prompt gate after composer storage rejects admission', async () => {
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Do not send without saving' } })
    const setItem = Storage.prototype.setItem
    let blocked = true
    const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      function (this: Storage, key, value) {
        if (this === localStorage && blocked && key === 'agentic-remote:composer-drafts-v2') {
          throw new DOMException('Storage access denied', 'SecurityError')
        }
        setItem.call(this, key, value)
      },
    )
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await screen.findByText(/Message was not sent/)
      blocked = false
      fireEvent.change(textarea, { target: { value: '' } })
      const failed = {
        ...session,
        failedPrompt: {
          content: 'A queued prompt needs recovery',
          failedAt: '2026-09-05T00:00:00.000Z',
        },
      }
      await act(async () => {
        MockWebSocket.instances.at(-1)?.onmessage?.({
          data: JSON.stringify({ type: 'session.upserted', session: failed }),
        } as MessageEvent)
      })
      expect(textarea).toHaveValue(failed.failedPrompt.content)
      expect(sendMessage).not.toHaveBeenCalled()
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() =>
        expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
          content: failed.failedPrompt.content,
          enqueue: false,
          acknowledgesFailure: failed.failedPrompt.failedAt,
        }),
      )
    } finally {
      storage.mockRestore()
    }
  })

  it.each(['agentic-remote:composer-drafts-v2', 'agentic-remote:composer-drafts'])(
    'keeps the legacy paste payload if initial composer storage at %s fails',
    async (failingKey) => {
      const label = '[Paste #1 - 21 lines]'
      const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join('\n')
      localStorage.setItem('agentic-remote:composer-drafts', JSON.stringify({
        'computer-1:session-1': label,
      }))
      localStorage.setItem('agentic-remote:composer-pastes', JSON.stringify({
        'computer-1:session-1': [{ id: 1, content: pasted, lineCount: 21 }],
      }))
      const setItem = Storage.prototype.setItem
      let blocked = true
      const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
        function (this: Storage, key, value) {
          if (this === localStorage && blocked && key === failingKey) {
            throw new DOMException('Storage access denied', 'SecurityError')
          }
          setItem.call(this, key, value)
        },
      )
      try {
        const rendered = render(<App />)
        const textarea = await screen.findByLabelText('Message')
        expect(textarea).toHaveValue(label)
        expect(screen.getByText(/could not be saved/)).toBeInTheDocument()
        expect(localStorage.getItem('agentic-remote:composer-pastes')).not.toBeNull()
        blocked = false
        fireEvent.change(textarea, { target: { value: `${label} edited` } })
        expect(screen.queryByText(/could not be saved/)).not.toBeInTheDocument()
        expect(localStorage.getItem('agentic-remote:composer-pastes')).toBeNull()
        expect(JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts') || '{}',
        )['computer-1:session-1']).toBe(`${pasted} edited`)
        rendered.unmount()
        render(<App />)
        expect(await screen.findByLabelText('Message')).toHaveValue(`${label} edited`)
        expect(sendMessage).not.toHaveBeenCalled()
      } finally {
        storage.mockRestore()
      }
    },
  )

  it.each([false, true])('keeps newer composer text when storage fails after confirmed acceptance (recovered=%s)', async (recovered) => {
    let accept: ((value: ManagedSession) => void) | undefined
    vi.mocked(sendMessage).mockReturnValueOnce(new Promise((resolve) => { accept = resolve }))
    if (recovered) {
      const failed = {
        ...session,
        failedPrompt: {
          content: 'Accepted message',
          failedAt: '2026-09-05T00:00:00.000Z',
        },
      }
      vi.mocked(listSessions).mockResolvedValue([failed])
      vi.mocked(getSession).mockResolvedValue(failed)
    }
    const rendered = render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Accepted message' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    const setItem = Storage.prototype.setItem
    let blocked = true
    const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      function (this: Storage, key, value) {
        if (this === localStorage && blocked && key.startsWith('agentic-remote:composer-')) {
          throw new DOMException('Full storage', 'QuotaExceededError')
        }
        setItem.call(this, key, value)
      },
    )
    try {
      fireEvent.change(textarea, { target: { value: 'Newer editable draft' } })
      await act(async () => { accept?.(session) })
      expect(textarea).toHaveValue('Newer editable draft')
      expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled()
      expect(screen.getByText(/could not be saved/)).toBeInTheDocument()
      expect(screen.queryByText(/Message was not sent/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Delivery could not be confirmed/)).not.toBeInTheDocument()
      blocked = false
      fireEvent.change(textarea, { target: { value: 'Newer editable draft updated' } })
      rendered.unmount()
      vi.mocked(listSessions).mockResolvedValue([session])
      vi.mocked(getSession).mockResolvedValue(session)
      render(<App />)
      expect(await screen.findByLabelText('Message')).toHaveValue('Newer editable draft updated')
      expect(sendMessage).toHaveBeenCalledOnce()
    } finally {
      storage.mockRestore()
    }
  })

  it.each(['agentic-remote:composer-drafts-v2', 'agentic-remote:composer-drafts'])(
    'reloads only the newer draft when accepted cleanup at %s fails',
    async (failingKey) => {
      const submitted = Array.from({ length: 21 }, (_, index) => `accepted ${index}`).join('\r\n')
      const newer = Array.from({ length: 22 }, (_, index) => `newer ${index}`).join('\n')
      let accept: ((value: ManagedSession) => void) | undefined
      vi.mocked(sendMessage).mockReturnValueOnce(new Promise((resolve) => { accept = resolve }))
      let rendered = render(<App />)
      let textarea = (await screen.findByLabelText('Message')) as HTMLTextAreaElement
      fireEvent.paste(textarea, { clipboardData: { getData: () => submitted } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
      fireEvent.change(textarea, { target: { value: 'Newer ' } })
      textarea.setSelectionRange(textarea.value.length, textarea.value.length)
      fireEvent.paste(textarea, { clipboardData: { getData: () => newer } })
      const display = 'Newer [Paste #1 - 22 lines]'
      expect(JSON.parse(
        localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}',
      )['computer-1:session-1'].text).toBe(display)
      const setItem = Storage.prototype.setItem
      let blocked = true
      const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
        function (this: Storage, key, value) {
          if (this === localStorage && blocked && key === failingKey) {
            throw new DOMException('Cleanup write refused', 'QuotaExceededError')
          }
          setItem.call(this, key, value)
        },
      )
      try {
        await act(async () => { accept?.(session) })
        expect(textarea).toHaveValue(display)
        expect(screen.getByText(/could not be saved/)).toBeInTheDocument()
        for (let reload = 0; reload < 2; reload += 1) {
          rendered.unmount()
          rendered = render(<App />)
          textarea = (await screen.findByLabelText('Message')) as HTMLTextAreaElement
          await act(async () => {
            MockWebSocket.instances.at(-1)?.onmessage?.({
              data: JSON.stringify({ type: 'session.upserted', session }),
            } as MessageEvent)
          })
          expect(textarea).toHaveValue(display)
          expect(screen.queryByText(/Delivery could not be confirmed/)).not.toBeInTheDocument()
          expect(sendMessage).toHaveBeenCalledOnce()
        }
        blocked = false
        fireEvent.change(textarea, { target: { value: `${display} edited` } })
        rendered.unmount()
        render(<App />)
        expect(await screen.findByLabelText('Message')).toHaveValue(`${display} edited`)
        fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
        await waitFor(() =>
          expect(sendMessage).toHaveBeenLastCalledWith('computer-1', 'session-1', {
            content: `Newer ${newer} edited`,
            enqueue: false,
          }),
        )
      } finally {
        storage.mockRestore()
      }
    },
  )

  it.each(['accepted', 'refused'])(
    'keeps the hidden failure token when a history preview is %s',
    async (outcome) => {
      const pasted = Array.from({ length: 21 }, (_, index) => `recovery ${index}`).join('\n')
      const failed = {
        ...session,
        messages: [{ ...session.messages[0]!, content: 'Unrelated history preview' }],
        failedPrompt: {
          content: 'Original failed prompt',
          failedAt: '2026-09-05T00:00:00.000Z',
        },
      }
      vi.mocked(listSessions).mockResolvedValue([failed])
      vi.mocked(getSession).mockResolvedValue(failed)
      if (outcome === 'accepted') {
        vi.mocked(sendMessage).mockResolvedValueOnce(failed)
      } else {
        vi.mocked(sendMessage).mockRejectedValueOnce(new Error('Preview refused'))
      }
      const rendered = render(<App />)
      const textarea = (await screen.findByLabelText('Message')) as HTMLTextAreaElement
      await waitFor(() => expect(textarea).toHaveValue(failed.failedPrompt.content))
      textarea.setSelectionRange(0, textarea.value.length)
      fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
      fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
      expect(textarea).toHaveValue('Unrelated history preview')
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
      expect(vi.mocked(sendMessage).mock.calls[0]?.[2].acknowledgesFailure).toBeUndefined()
      await waitFor(() =>
        expect(textarea).toHaveValue(outcome === 'accepted'
          ? '[Paste #1 - 21 lines]'
          : 'Unrelated history preview\n\n[Paste #1 - 21 lines]'),
      )
      expect(JSON.parse(
        localStorage.getItem('agentic-remote:composer-draft-failures') || '{}',
      )['computer-1:session-1']).toBe(failed.failedPrompt.failedAt)
      if (outcome === 'refused') {
        fireEvent.change(textarea, { target: { value: '[Paste #1 - 21 lines]' } })
      }
      fireEvent.change(textarea, { target: { value: '[Paste #1 - 21 lines] continued' } })
      rendered.unmount()
      vi.mocked(sendMessage).mockResolvedValueOnce({ ...failed, failedPrompt: undefined })
      render(<App />)
      expect(await screen.findByLabelText('Message')).toHaveValue('[Paste #1 - 21 lines] continued')
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() =>
        expect(sendMessage).toHaveBeenLastCalledWith('computer-1', 'session-1', {
          content: `${pasted} continued`,
          enqueue: false,
          acknowledgesFailure: failed.failedPrompt.failedAt,
        }),
      )
    },
  )

  it.each(['/statusline off', '/clear', '/restart', '/cwd'])(
    'keeps the hidden paste for local command preview %s',
    async (command) => {
      const pasted = Array.from({ length: 21 }, (_, index) => `draft ${index}`).join('\n')
      const history = {
        ...session,
        messages: [{ ...session.messages[0]!, content: command }],
      }
      const replacement = { ...session, id: 'cleared-session', messages: [] }
      vi.mocked(listSessions).mockResolvedValue([history])
      vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
        sessionId === replacement.id ? replacement : history,
      )
      vi.mocked(clearConversation).mockResolvedValue(replacement)
      const rendered = render(<App />)
      const textarea = await screen.findByLabelText('Message')
      fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
      fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
      expect(textarea).toHaveValue(command)
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() => expect(textarea).toHaveValue('[Paste #1 - 21 lines]'))
      expect(sendMessage).not.toHaveBeenCalled()
      expect(executeCommand).not.toHaveBeenCalled()
      if (command === '/clear') {
        await waitFor(() => expect(window.location.search).toContain('session=cleared-session'))
      }
      rendered.unmount()
      const target = command === '/clear' ? replacement : history
      vi.mocked(listSessions).mockResolvedValue([target])
      vi.mocked(getSession).mockResolvedValue(target)
      vi.mocked(sendMessage).mockResolvedValueOnce(target)
      render(<App />)
      expect(await screen.findByLabelText('Message')).toHaveValue('[Paste #1 - 21 lines]')
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() =>
        expect(sendMessage).toHaveBeenCalledWith('computer-1', target.id, {
          content: pasted,
          enqueue: false,
        }),
      )
    },
  )

  it('does not overwrite unreadable saved drafts while keeping new text editable', async () => {
    const original = JSON.stringify({
      'computer-1:session-1': { text: 'Original saved draft', pastes: [] },
    })
    localStorage.setItem('agentic-remote:composer-drafts-v2', original)
    localStorage.setItem('agentic-remote:composer-drafts-generation', '1')
    localStorage.setItem('agentic-remote:composer-drafts', JSON.stringify({
      'computer-1:session-1': 'Original saved draft',
    }))
    const getItem = Storage.prototype.getItem
    const storage = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      function (this: Storage, key) {
        if (this === localStorage && key.startsWith('agentic-remote:composer')) {
          throw new DOMException('Draft reads are blocked', 'SecurityError')
        }
        return getItem.call(this, key)
      },
    )
    const rendered = render(<App />)
    try {
      const textarea = await screen.findByLabelText('Message')
      fireEvent.change(textarea, { target: { value: 'New text remains editable' } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await screen.findByText(/Message was not sent/)
      expect(textarea).toHaveValue('New text remains editable')
      expect(sendMessage).not.toHaveBeenCalled()
      expect(getItem.call(localStorage, 'agentic-remote:composer-drafts-v2')).toBe(original)
    } finally {
      storage.mockRestore()
    }
    rendered.unmount()
    render(<App />)
    expect(await screen.findByLabelText('Message')).toHaveValue('Original saved draft')
  })

  it.each([
    ['transcription', false], ['transcription', true],
    ['upload', false], ['upload', true],
  ] as const)(
    'appends an async %s completion to the durable draft during history preview (switched=%s)',
    async (kind, switched) => {
      const pasted = Array.from({ length: 21 }, (_, index) => `hidden draft ${index}`).join('\n')
      const label = '[Paste #1 - 21 lines]'
      const addition = kind === 'transcription'
        ? `Transcribed completion with literal ${label}`
        : 'Attached file: `/synthetic/owned-note.txt`'
      let finish: (() => void) | undefined
      if (kind === 'transcription') {
        vi.mocked(transcribeAudio).mockReturnValueOnce(new Promise((resolve) => {
          finish = () => resolve({ transcript: addition, durationSeconds: 1 })
        }))
      } else {
        vi.mocked(uploadSessionFile).mockReturnValueOnce(new Promise((resolve) => {
          finish = () => resolve({ name: 'owned-note.txt', path: '/synthetic/owned-note.txt', size: 4 })
        }))
      }
      vi.mocked(listSessions).mockResolvedValue([session, secondSession])
      vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
        sessionId === secondSession.id ? secondSession : session,
      )
      const rendered = render(<App />)
      const textarea = (await screen.findByLabelText('Message')) as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: 'Keep ' } })
      textarea.setSelectionRange(5, 5)
      fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
      const file = new File(['data'], kind === 'transcription' ? 'voice.webm' : 'owned-note.txt', {
        type: kind === 'transcription' ? 'audio/webm' : 'text/plain',
      })
      fireEvent.change(screen.getByLabelText('File attachment'), { target: { files: [file] } })
      await waitFor(() => expect(kind === 'transcription' ? transcribeAudio : uploadSessionFile).toHaveBeenCalledOnce())
      fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
      expect(textarea).toHaveValue('Hello agent')
      if (switched) {
        fireEvent.click(screen.getByText('Second chat').closest('button')!)
        fireEvent.change(textarea, { target: { value: 'Other session stays intact' } })
      }
      await act(async () => { finish?.() })
      if (switched) {
        expect(textarea).toHaveValue('Other session stays intact')
        fireEvent.click(screen.getByText('Project chat').closest('button')!)
      }
      expect(textarea).toHaveValue(`Keep ${label}\n\n${addition}`)
      expect(sendMessage).not.toHaveBeenCalled()
      rendered.unmount()
      render(<App />)
      expect(await screen.findByLabelText('Message')).toHaveValue(`Keep ${label}\n\n${addition}`)
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() =>
        expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
          content: `Keep ${pasted}\n\n${addition}`, enqueue: false,
        }),
      )
    },
  )

  it.each([
    ['agentic-remote:composer-drafts-v2', '{'],
    ['agentic-remote:composer-drafts', '{'],
    ['agentic-remote:composer-drafts-generation', '{'],
    ['agentic-remote:composer-pastes', '{'],
    ['agentic-remote:composer-draft-failures', '{'],
    ['agentic-remote:composer-draft-recovered', '{'],
    ['agentic-remote:composer-drafts-v2', '{"computer-1:session-1":{"text":"Saved","pastes":{}}}'],
    ['agentic-remote:composer-drafts', '{"computer-1:session-1":42}'],
    ['agentic-remote:composer-drafts-generation', '{"version":1,"accepted":"invalid"}'],
    ['agentic-remote:composer-pastes', '{"computer-1:session-1":{}}'],
    ['agentic-remote:composer-draft-failures', '{"computer-1:session-1":42}'],
    ['agentic-remote:composer-draft-recovered', '[]'],
    ['agentic-remote:composer-drafts-v2', 'null'],
    ['agentic-remote:composer-drafts-v2', '{"computer-1:session-1":{"text":"Saved","pastes":[null]}}'],
    ['agentic-remote:composer-drafts-v2', '{"computer-1:session-1":{"text":"Saved","pastes":[],"unresolvedPastes":"bad"}}'],
    ['agentic-remote:composer-drafts-v2', '{"computer-1:session-1":{"text":"Saved","pastes":[],"unresolvedPastes":[{"key":"duplicate","id":1,"content":"first\\nsecond\\nthird\\nfourth\\nfifth\\nsixth\\nseventh\\neighth\\nninth\\ntenth\\neleventh\\ntwelfth\\nthirteenth\\nfourteenth\\nfifteenth\\nsixteenth\\nseventeenth\\neighteenth\\nnineteenth\\ntwentieth\\ntwenty-first","lineCount":21},{"key":"duplicate","id":2,"content":"one\\ntwo\\nthree\\nfour\\nfive\\nsix\\nseven\\neight\\nnine\\nten\\neleven\\ntwelve\\nthirteen\\nfourteen\\nfifteen\\nsixteen\\nseventeen\\neighteen\\nnineteen\\ntwenty\\ntwenty-one","lineCount":21}]}}'],
    ['agentic-remote:composer-drafts-v2', '{"computer-1:session-1":{"text":"Saved","pastes":[],"pendingSubmission":{"text":"pending","pastes":[]}}}'],
    ['agentic-remote:composer-drafts-generation', '{"version":2,"accepted":[]}'],
    ['agentic-remote:composer-drafts-generation', '{"version":1,"accepted":[{"key":"computer-1:session-1"}]}'],
    ['agentic-remote:composer-drafts', '{"session-1":"Unscoped legacy text"}'],
    ['agentic-remote:composer-drafts-v2', '{"computer-1:session-1":{"text":"Saved","pastes":[],"pendingSubmission":{"id":"pending","text":"content","pastes":[],"originKey":"missing-computer"}}}'],
  ] as const)(
    'locks composer-owned storage without overwriting good data when %s contains %s',
    async (corruptKey, corruptValue) => {
      const pasted = Array.from({ length: 21 }, (_, index) => `saved content ${index}`).join('\n')
      const label = '[Paste #1 - 21 lines]'
      const valid: Record<string, string> = {
        'agentic-remote:composer-drafts-v2': JSON.stringify({
          'computer-1:session-1': {
            text: `Saved ${label}`,
            pastes: [{ key: 'saved-paste', id: 1, content: pasted, lineCount: 21, start: 6 }],
          },
        }),
        'agentic-remote:composer-drafts': JSON.stringify({ 'computer-1:session-1': `Saved ${pasted}` }),
        'agentic-remote:composer-drafts-generation': '1',
        'agentic-remote:composer-pastes': '{}',
        'agentic-remote:composer-draft-failures': '{}',
        'agentic-remote:composer-draft-recovered': '{}',
      }
      for (const [key, value] of Object.entries(valid)) localStorage.setItem(key, value)
      localStorage.setItem(corruptKey, corruptValue)
      const before = Object.fromEntries(Object.keys(valid).map((key) => [key, localStorage.getItem(key)]))
      const rendered = render(<App />)
      const textarea = await screen.findByLabelText('Message')
      expect(screen.getByText(/Saved drafts could not be read/)).toBeInTheDocument()
      fireEvent.change(textarea, { target: { value: 'New editable text while locked' } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await screen.findByText(/Message was not sent/)
      expect(textarea).toHaveValue('New editable text while locked')
      expect(sendMessage).not.toHaveBeenCalled()
      for (const [key, value] of Object.entries(before)) expect(localStorage.getItem(key)).toBe(value)
      localStorage.setItem(corruptKey, valid[corruptKey])
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      expect(sendMessage).not.toHaveBeenCalled()
      rendered.unmount()
      render(<App />)
      expect(await screen.findByLabelText('Message')).toHaveValue(`Saved ${label}`)
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() =>
        expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
          content: `Saved ${pasted}`, enqueue: false,
        }),
      )
    },
  )

  it('keeps the composer read-failure lock through Strict Mode after a transient malformed read', async () => {
    const original = JSON.stringify({
      'computer-1:session-1': { text: 'Original durable draft', pastes: [] },
    })
    localStorage.setItem('agentic-remote:composer-drafts-v2', original)
    localStorage.setItem('agentic-remote:composer-drafts-generation', '1')
    localStorage.setItem('agentic-remote:composer-drafts', JSON.stringify({
      'computer-1:session-1': 'Original durable draft',
    }))
    const getItem = Storage.prototype.getItem
    let failOnce = true
    const storage = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      function (this: Storage, key) {
        if (this === localStorage && key === 'agentic-remote:composer-drafts' && failOnce) {
          failOnce = false
          return '{'
        }
        return getItem.call(this, key)
      },
    )
    const rendered = render(<StrictMode><App /></StrictMode>)
    try {
      const textarea = await screen.findByLabelText('Message')
      expect(screen.getByText(/Saved drafts could not be read/)).toBeInTheDocument()
      fireEvent.change(textarea, { target: { value: 'Volatile new text' } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await screen.findByText(/Message was not sent/)
      expect(textarea).toHaveValue('Volatile new text')
      expect(localStorage.getItem('agentic-remote:composer-drafts-v2')).toBe(original)
      expect(sendMessage).not.toHaveBeenCalled()
    } finally {
      storage.mockRestore()
    }
    rendered.unmount()
    render(<App />)
    expect(await screen.findByLabelText('Message')).toHaveValue('Original durable draft')
  })

  it('locks composer writes if malformed storage appears after startup', async () => {
    const rendered = render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Last complete saved draft' } })
    const original = localStorage.getItem('agentic-remote:composer-drafts-v2')
    const legacy = localStorage.getItem('agentic-remote:composer-drafts')!
    localStorage.setItem('agentic-remote:composer-drafts', '{')
    fireEvent.change(textarea, { target: { value: 'Newer unsaved draft' } })
    expect(textarea).toHaveValue('Newer unsaved draft')
    expect(screen.getByText(/Saved drafts could not be read/)).toBeInTheDocument()
    expect(localStorage.getItem('agentic-remote:composer-drafts-v2')).toBe(original)
    expect(localStorage.getItem('agentic-remote:composer-drafts')).toBe('{')
    localStorage.setItem('agentic-remote:composer-drafts', legacy)
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await screen.findByText(/Message was not sent/)
    expect(sendMessage).not.toHaveBeenCalled()
    rendered.unmount()
    render(<App />)
    expect(await screen.findByLabelText('Message')).toHaveValue('Last complete saved draft')
  })

  it('keeps the missing acceptance receipt warning visible after switching sessions', async () => {
    let accept: ((value: ManagedSession) => void) | undefined
    vi.mocked(sendMessage).mockReturnValueOnce(new Promise((resolve) => { accept = resolve }))
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
      sessionId === secondSession.id ? secondSession : session,
    )
    const rendered = render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Submitted from session A' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    fireEvent.change(textarea, { target: { value: 'Newer draft in A' } })
    fireEvent.click(screen.getByText('Second chat').closest('button')!)
    fireEvent.change(textarea, { target: { value: 'Draft in B' } })
    const setItem = Storage.prototype.setItem
    let blocked = true
    const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      function (this: Storage, key, value) {
        if (this === localStorage && blocked && key.startsWith('agentic-remote:composer-')) {
          throw new DOMException('Receipt writes denied', 'SecurityError')
        }
        setItem.call(this, key, value)
      },
    )
    try {
      await act(async () => { accept?.(session) })
      expect(textarea).toHaveValue('Draft in B')
      expect(screen.getByText(/This send was accepted, but the browser has no saved receipt/)).toHaveTextContent('Project chat')
      fireEvent.change(textarea, { target: { value: 'Draft in B remains editable' } })
      expect(screen.getByText(/browser has no saved receipt/)).toBeInTheDocument()
      expect(sendMessage).toHaveBeenCalledOnce()
      blocked = false
      fireEvent.change(textarea, { target: { value: 'Draft in B now saved' } })
      expect(screen.queryByText(/browser has no saved receipt/)).not.toBeInTheDocument()
      rendered.unmount()
      render(<App />)
      expect(await screen.findByLabelText('Message')).toHaveValue('Draft in B now saved')
      fireEvent.click(screen.getByText('Project chat').closest('button')!)
      expect(screen.getByLabelText('Message')).toHaveValue('Newer draft in A')
      expect(sendMessage).toHaveBeenCalledOnce()
    } finally {
      storage.mockRestore()
    }
  })

  it('refuses admission when acceptance receipts cannot be read', async () => {
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Keep this draft' } })
    const getItem = Storage.prototype.getItem
    const storage = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      function (this: Storage, key) {
        if (this === localStorage && key === 'agentic-remote:composer-drafts-generation') {
          throw new DOMException('Receipt reads are blocked', 'SecurityError')
        }
        return getItem.call(this, key)
      },
    )
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await screen.findByText(/Message was not sent/)
      expect(textarea).toHaveValue('Keep this draft')
      expect(sendMessage).not.toHaveBeenCalled()
      expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled()
    } finally {
      storage.mockRestore()
    }
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledExactlyOnceWith(
      'computer-1', 'session-1', { content: 'Keep this draft', enqueue: false },
    ))
  })

  it('warns honestly when an accepted send cannot save any receipt before reload', async () => {
    let accept: ((value: ManagedSession) => void) | undefined
    vi.mocked(sendMessage).mockReturnValueOnce(new Promise((resolve) => { accept = resolve }))
    const rendered = render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Accepted but unrecorded' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    fireEvent.change(textarea, { target: { value: 'Newer saved draft' } })
    const setItem = Storage.prototype.setItem
    let blocked = true
    const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      function (this: Storage, key, value) {
        if (this === localStorage && blocked) {
          throw new DOMException('All writes denied', 'SecurityError')
        }
        setItem.call(this, key, value)
      },
    )
    try {
      await act(async () => { accept?.(session) })
      expect(textarea).toHaveValue('Newer saved draft')
      expect(screen.getByText(/This send was accepted, but the browser has no saved receipt/)).toBeInTheDocument()
      expect(screen.queryByText(/Delivery could not be confirmed/)).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await screen.findByText(/Message was not sent/)
      expect(sendMessage).toHaveBeenCalledOnce()
      expect(textarea).toHaveValue('Newer saved draft')
      rendered.unmount()
      blocked = false
      render(<App />)
      expect(await screen.findByLabelText('Message')).toHaveValue(
        'Accepted but unrecorded\n\nNewer saved draft',
      )
      expect(screen.getByText(/Delivery could not be confirmed/)).toBeInTheDocument()
      expect(screen.queryByText(/This send was accepted/)).not.toBeInTheDocument()
      expect(sendMessage).toHaveBeenCalledOnce()
    } finally {
      storage.mockRestore()
    }
  })

  it('bounds acceptance receipts without evicting unresolved submission identities', async () => {
    let accept: ((value: ManagedSession) => void) | undefined
    vi.mocked(sendMessage).mockReturnValueOnce(new Promise((resolve) => { accept = resolve }))
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Current submission' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    fireEvent.change(textarea, { target: { value: 'Newer draft' } })
    const stored = JSON.parse(
      localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}',
    )
    const receipts = Array.from({ length: 64 }, (_, index) => ({
      key: `computer-1:held-${index}`,
      id: `held-id-${index}`,
    }))
    for (const receipt of receipts) {
      stored[receipt.key] = {
        text: '', pastes: [],
        pendingSubmission: {
          id: receipt.id, originKey: receipt.key, text: 'Held payload', pastes: [],
        },
      }
    }
    localStorage.setItem('agentic-remote:composer-drafts-v2', JSON.stringify(stored))
    const marker = JSON.stringify({ version: 1, accepted: receipts })
    localStorage.setItem('agentic-remote:composer-drafts-generation', marker)
    await act(async () => { accept?.(session) })
    expect(textarea).toHaveValue('Newer draft')
    expect(screen.getByText(/Browser acceptance receipt storage is full/)).toBeInTheDocument()
    expect(screen.getByText(/browser has no saved receipt/)).toBeInTheDocument()
    expect(localStorage.getItem('agentic-remote:composer-drafts-generation')).toBe(marker)
    expect(sendMessage).toHaveBeenCalledOnce()
  })

  it('scopes acceptance receipts to the originating session through replacement IDs', async () => {
    const remote = {
      ...session,
      computerId: secondComputer.id,
      computerName: secondComputer.name,
      title: 'Other computer draft',
    }
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    vi.mocked(listSessions).mockResolvedValue([session, remote])
    vi.mocked(getSession).mockImplementation(async (computerId) =>
      computerId === computer.id ? session : remote,
    )
    const originalKey = 'computer-1:before-two-clears'
    localStorage.setItem('agentic-remote:composer-drafts-generation', JSON.stringify({
      version: 1,
      accepted: [{ key: originalKey, id: 'same-local-id' }],
    }))
    localStorage.setItem('agentic-remote:composer-drafts-v2', JSON.stringify({
      'computer-1:session-1': {
        text: 'Local newer draft',
        pastes: [],
        pendingSubmission: {
          id: 'same-local-id', originKey: originalKey, text: 'Local accepted', pastes: [],
        },
      },
      'computer-2:session-1': {
        text: 'Remote newer draft',
        pastes: [],
        pendingSubmission: {
          id: 'same-local-id', originKey: 'computer-2:session-1', text: 'Remote unconfirmed', pastes: [],
        },
      },
    }))
    localStorage.setItem('agentic-remote:composer-drafts', JSON.stringify({
      'computer-1:session-1': 'Local accepted\n\nLocal newer draft',
      'computer-2:session-1': 'Remote unconfirmed\n\nRemote newer draft',
    }))
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    expect(textarea).toHaveValue('Local newer draft')
    expect(screen.queryByText(/Delivery could not be confirmed/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Other computer draft').closest('button')!)
    expect(textarea).toHaveValue('Remote unconfirmed\n\nRemote newer draft')
    expect(screen.getByText(/Delivery could not be confirmed/)).toBeInTheDocument()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it.each(['', 'Written in an older build'])(
    'honors a newer legacy draft after an acceptance receipt: %s',
    async (legacyText) => {
      localStorage.setItem('agentic-remote:composer-drafts-generation', JSON.stringify({
        version: 1,
        accepted: [{ key: 'computer-1:session-1', id: 'accepted-id' }],
      }))
      localStorage.setItem('agentic-remote:composer-drafts-v2', JSON.stringify({
        'computer-1:session-1': {
          text: '',
          pastes: [],
          pendingSubmission: {
            id: 'accepted-id', originKey: 'computer-1:session-1', text: 'Already accepted', pastes: [],
          },
        },
      }))
      localStorage.setItem('agentic-remote:composer-drafts', JSON.stringify(
        legacyText ? { 'computer-1:session-1': legacyText } : {},
      ))
      const rendered = render(<App />)
      expect(await screen.findByLabelText('Message')).toHaveValue(legacyText)
      rendered.unmount()
      render(<App />)
      expect(await screen.findByLabelText('Message')).toHaveValue(legacyText)
      expect(localStorage.getItem('agentic-remote:composer-drafts-generation')).toBe('1')
      expect(sendMessage).not.toHaveBeenCalled()
    },
  )

  it('retires an accepted receipt with no newer text instead of falling back to the legacy payload', async () => {
    localStorage.setItem('agentic-remote:composer-drafts-generation', JSON.stringify({
      version: 1,
      accepted: [{ key: 'computer-1:session-1', id: 'accepted-id' }],
    }))
    localStorage.setItem('agentic-remote:composer-drafts-v2', JSON.stringify({
      'computer-1:session-1': {
        text: '', pastes: [],
        pendingSubmission: {
          id: 'accepted-id', text: 'Already accepted', pastes: [],
        },
      },
    }))
    localStorage.setItem('agentic-remote:composer-drafts', JSON.stringify({
      'computer-1:session-1': 'Already accepted',
    }))
    const rendered = render(<App />)
    expect(await screen.findByLabelText('Message')).toHaveValue('')
    expect(screen.queryByText(/Delivery could not be confirmed/)).not.toBeInTheDocument()
    rendered.unmount()
    render(<App />)
    expect(await screen.findByLabelText('Message')).toHaveValue('')
    expect(localStorage.getItem('agentic-remote:composer-drafts-generation')).toBe('1')
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('preserves a local clear preview draft through two replacements and later typing', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `draft ${index}`).join('\n')
    const history = {
      ...session,
      messages: [{ ...session.messages[0]!, content: '/clear' }],
    }
    const middle = { ...session, id: 'replacement-b', messages: [] }
    const final = {
      ...session,
      id: 'replacement-c',
      messages: [],
      replacedSessionIds: ['replacement-b', 'session-1'],
    }
    let finishClear: ((value: ManagedSession) => void) | undefined
    vi.mocked(clearConversation).mockReturnValueOnce(new Promise((resolve) => { finishClear = resolve }))
    vi.mocked(listSessions).mockResolvedValue([history])
    vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
      sessionId === session.id ? history : final,
    )
    const rendered = render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
    fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(clearConversation).toHaveBeenCalledOnce())
    await act(async () => {
      for (const [from, to] of [['session-1', middle.id], [middle.id, final.id]]) {
        MockWebSocket.instances.at(-1)?.onmessage?.({
          data: JSON.stringify({
            type: 'session.removed', computerId: computer.id,
            sessionId: from, replacedBy: to,
          }),
        } as MessageEvent)
      }
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: final }),
      } as MessageEvent)
    })
    expect(textarea).toHaveValue('[Paste #1 - 21 lines]')
    fireEvent.change(textarea, { target: { value: '[Paste #1 - 21 lines] later' } })
    await act(async () => { finishClear?.(middle) })
    expect(textarea).toHaveValue('[Paste #1 - 21 lines] later')
    expect(window.location.search).toContain('session=replacement-c')
    expect(sendMessage).not.toHaveBeenCalled()
    rendered.unmount()
    vi.mocked(listSessions).mockResolvedValue([final])
    vi.mocked(getSession).mockResolvedValue(final)
    vi.mocked(sendMessage).mockResolvedValueOnce(final)
    render(<App />)
    expect(await screen.findByLabelText('Message')).toHaveValue('[Paste #1 - 21 lines] later')
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith('computer-1', final.id, {
        content: `${pasted} later`, enqueue: false,
      }),
    )
  })

  it('reloads the unsent collapsed-paste draft rather than its history preview', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `  line ${index}\r`)
      .join('\n')
    const display = 'Before [Paste #1 - 22 lines] after  '
    let rendered = render(<StrictMode><App /></StrictMode>)
    let textarea = (await screen.findByLabelText('Message')) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Before  after  ' } })
    textarea.setSelectionRange(7, 7)
    fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
    expect(textarea).toHaveValue(display)
    fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
    expect(textarea).toHaveValue('Hello agent')

    rendered.unmount()
    rendered = render(<StrictMode><App /></StrictMode>)
    textarea = (await screen.findByLabelText('Message')) as HTMLTextAreaElement
    await act(async () => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session }),
      } as MessageEvent)
    })
    expect(textarea).toHaveValue(display)
    expect(sendMessage).not.toHaveBeenCalled()
    fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
    expect(textarea).toHaveValue('Hello agent')
    fireEvent.keyDown(textarea, { key: 'ArrowDown' })
    expect(textarea).toHaveValue(display)

    rendered.unmount()
    render(<StrictMode><App /></StrictMode>)
    expect(await screen.findByLabelText('Message')).toHaveValue(display)
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenLastCalledWith('computer-1', 'session-1', {
        content: `Before ${pasted} after  `,
        enqueue: false,
      }),
    )
  })

  it.each([false, true])(
    'reloads a complete collapsed-paste submission while acceptance is pending (enqueue=%s)',
    async (enqueue) => {
      const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join('\n')
      const running = { ...session, status: 'running' as const }
      vi.mocked(listSessions).mockResolvedValue([running])
      vi.mocked(getSession).mockResolvedValue(running)
      vi.mocked(sendMessage).mockReturnValueOnce(new Promise(() => {}))
      let rendered = render(<StrictMode><App /></StrictMode>)
      const textarea = await screen.findByLabelText('Message')
      fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
      fireEvent.click(
        screen.getByRole('button', { name: enqueue ? 'Queue message' : 'Send message' }),
      )
      await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
      expect(textarea).toHaveValue('')

      rendered.unmount()
      rendered = render(<StrictMode><App /></StrictMode>)
      const restored = await screen.findByLabelText('Message')
      await act(async () => {
        MockWebSocket.instances.at(-1)?.onmessage?.({
          data: JSON.stringify({ type: 'session.upserted', session: running }),
        } as MessageEvent)
      })
      expect(restored).toHaveValue('[Paste #1 - 21 lines]')
      expect(screen.getByText(/Delivery could not be confirmed/)).toBeInTheDocument()
      expect(sendMessage).toHaveBeenCalledOnce()

      rendered.unmount()
      render(<StrictMode><App /></StrictMode>)
      expect(await screen.findByLabelText('Message')).toHaveValue('[Paste #1 - 21 lines]')
      expect(screen.getByText(/Delivery could not be confirmed/)).toBeInTheDocument()
      expect(sendMessage).toHaveBeenCalledOnce()
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() =>
        expect(sendMessage).toHaveBeenLastCalledWith('computer-1', 'session-1', {
          content: pasted,
          enqueue: false,
        }),
      )
      await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(''))
      expect(screen.queryByText(/Delivery could not be confirmed/)).not.toBeInTheDocument()
    },
  )

  it('reloads an unconfirmed recovery even after the failure marker disappears', async () => {
    const failed = {
      ...session,
      failedPrompt: {
        content: 'Previously recovered prompt',
        failedAt: '2026-09-04T12:00:00.000Z',
      },
    }
    vi.mocked(listSessions).mockResolvedValue([failed])
    vi.mocked(getSession).mockResolvedValue(failed)
    vi.mocked(sendMessage).mockReturnValueOnce(new Promise(() => {}))
    const rendered = render(<App />)
    const textarea = await screen.findByLabelText('Message')
    await waitFor(() => expect(textarea).toHaveValue(failed.failedPrompt.content))
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    rendered.unmount()

    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)
    render(<App />)
    const restored = await screen.findByLabelText('Message')
    await act(async () => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session }),
      } as MessageEvent)
    })
    expect(restored).toHaveValue(failed.failedPrompt.content)
    expect(screen.getByText(/Delivery could not be confirmed/)).toBeInTheDocument()
    expect(sendMessage).toHaveBeenCalledOnce()
  })

  it('keeps newer composer text when an in-flight recovery is accepted', async () => {
    const failed = {
      ...session,
      failedPrompt: {
        content: 'Same words, newly typed',
        failedAt: '2026-09-04T12:00:00.000Z',
      },
    }
    let finishSend: ((value: ManagedSession) => void) | undefined
    vi.mocked(listSessions).mockResolvedValue([failed])
    vi.mocked(getSession).mockResolvedValue(failed)
    vi.mocked(sendMessage).mockReturnValueOnce(
      new Promise((resolve) => { finishSend = resolve }),
    )
    const rendered = render(<App />)
    const textarea = await screen.findByLabelText('Message')
    await waitFor(() => expect(textarea).toHaveValue(failed.failedPrompt.content))
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    expect(textarea).toBeEnabled()
    fireEvent.change(textarea, { target: { value: failed.failedPrompt.content } })
    await act(async () => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session }),
      } as MessageEvent)
    })
    expect(textarea).toHaveValue(failed.failedPrompt.content)
    await act(async () => { finishSend?.(session) })
    expect(textarea).toHaveValue(failed.failedPrompt.content)

    rendered.unmount()
    vi.mocked(listSessions).mockResolvedValue([session])
    vi.mocked(getSession).mockResolvedValue(session)
    render(<App />)
    expect(await screen.findByLabelText('Message')).toHaveValue(failed.failedPrompt.content)
    expect(screen.queryByText(/Delivery could not be confirmed/)).not.toBeInTheDocument()
  })

  it('keeps a collapsed-paste draft behind history while sessions and failures refresh', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join('\n')
    const refreshed: ManagedSession = {
      ...session,
      revision: 2,
      failedPrompt: {
        content: 'A different queued prompt failed',
        failedAt: '2026-09-04T12:00:00.000Z',
      },
      messages: [
        ...session.messages,
        {
          id: 'newer-history',
          role: 'user',
          content: 'New history prompt',
          createdAt: '2026-09-04T12:00:00.000Z',
        },
      ],
    }
    const rendered = render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
    fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
    expect(textarea).toHaveValue('Hello agent')
    await act(async () => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: refreshed }),
      } as MessageEvent)
    })
    expect(textarea).toHaveValue('Hello agent')
    fireEvent.keyDown(textarea, { key: 'ArrowDown' })
    expect(textarea).toHaveValue('[Paste #1 - 21 lines]')

    rendered.unmount()
    vi.mocked(listSessions).mockResolvedValue([refreshed])
    vi.mocked(getSession).mockResolvedValue(refreshed)
    render(<App />)
    expect(await screen.findByLabelText('Message')).toHaveValue('[Paste #1 - 21 lines]')
    expect(sendMessage).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        content: pasted,
        enqueue: false,
      }),
    )
  })

  it('reloads pending and newer collapsed pastes without borrowing another computer draft', async () => {
    const submitted = Array.from({ length: 21 }, (_, index) => `pending ${index}`).join('\r\n')
    const newer = Array.from({ length: 22 }, (_, index) => `newer ${index}`).join('\n')
    const remote = Array.from({ length: 23 }, (_, index) => `remote ${index}`).join('\n')
    const running = { ...session, status: 'running' as const }
    const nodeSession = {
      ...session,
      computerId: secondComputer.id,
      computerName: secondComputer.name,
      title: 'Node draft',
    }
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    vi.mocked(listSessions).mockResolvedValue([running, nodeSession])
    vi.mocked(getSession).mockImplementation(async (computerId) =>
      computerId === secondComputer.id ? nodeSession : running,
    )
    vi.mocked(sendMessage)
      .mockImplementation(async (computerId) =>
        computerId === secondComputer.id ? nodeSession : running,
      )
      .mockReturnValueOnce(new Promise(() => {}))
    let rendered = render(<App />)
    let textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, { clipboardData: { getData: () => submitted } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    expect(textarea).toBeEnabled()
    fireEvent.paste(textarea, { clipboardData: { getData: () => newer } })
    fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
    expect(textarea).toHaveValue('Hello agent')
    fireEvent.click(screen.getByText('Node draft').closest('button')!)
    expect(textarea).toHaveValue('')
    fireEvent.paste(textarea, { clipboardData: { getData: () => remote } })

    rendered.unmount()
    rendered = render(<App />)
    textarea = await screen.findByLabelText('Message')
    expect(textarea).toHaveValue('[Paste #1 - 23 lines]')
    expect(screen.queryByText(/Delivery could not be confirmed/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Project chat').closest('button')!)
    expect(textarea).toHaveValue('[Paste #2 - 21 lines]\n\n[Paste #1 - 22 lines]')
    expect(screen.getByText(/Delivery could not be confirmed/)).toBeInTheDocument()
    expect(sendMessage).toHaveBeenCalledOnce()

    rendered.unmount()
    render(<App />)
    expect(await screen.findByLabelText('Message')).toHaveValue(
      '[Paste #2 - 21 lines]\n\n[Paste #1 - 22 lines]',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenLastCalledWith('computer-1', 'session-1', {
        content: `${submitted}\n\n${newer}`,
        enqueue: false,
      }),
    )
    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(''))
    fireEvent.click(screen.getByText('Node draft').closest('button')!)
    expect(screen.getByLabelText('Message')).toHaveValue('[Paste #1 - 23 lines]')
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenLastCalledWith('computer-2', 'session-1', {
        content: remote,
        enqueue: false,
      }),
    )
  })

  it.each(['accepted', 'rejected'])(
    'keeps newer collapsed pastes across a two-hop replacement when the old send is %s',
    async (outcome) => {
      const submitted = Array.from({ length: 21 }, (_, index) => `pending ${index}`).join('\n')
      const newer = Array.from({ length: 21 }, (_, index) => `newer ${index}`).join('\n')
      const label = '[Paste #1 - 21 lines]'
      const replacement = {
        ...session,
        id: 'replacement-c',
        title: 'Replacement C',
        messages: [],
        replacedSessionIds: ['replacement-b', 'session-1'],
      }
      localStorage.setItem('agentic-remote:composer-drafts-v2', JSON.stringify({
        'computer-1:replacement-c': {
          text: label,
          pastes: [{ key: 'newer-paste', id: 1, content: newer, lineCount: 21, start: 0 }],
        },
      }))
      let accept: ((value: ManagedSession) => void) | undefined
      let reject: ((reason: Error) => void) | undefined
      vi.mocked(sendMessage).mockReturnValueOnce(new Promise((resolve, fail) => {
        accept = resolve
        reject = fail
      }))
      vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
        sessionId === session.id ? session : replacement,
      )
      const rendered = render(<App />)
      const textarea = await screen.findByLabelText('Message')
      fireEvent.paste(textarea, { clipboardData: { getData: () => submitted } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
      await act(async () => {
        for (const [from, to] of [
          ['session-1', 'replacement-b'],
          ['replacement-b', 'replacement-c'],
        ]) {
          MockWebSocket.instances.at(-1)?.onmessage?.({
            data: JSON.stringify({
              type: 'session.removed',
              computerId: 'computer-1',
              sessionId: from,
              replacedBy: to,
            }),
          } as MessageEvent)
        }
        MockWebSocket.instances.at(-1)?.onmessage?.({
          data: JSON.stringify({ type: 'session.upserted', session: replacement }),
        } as MessageEvent)
      })
      expect(textarea).toHaveValue(label)
      await act(async () => {
        if (outcome === 'accepted') {
          accept?.(session)
        } else {
          reject?.(new Error('Connection lost'))
        }
      })
      const expected = outcome === 'accepted'
        ? label
        : '[Paste #2 - 21 lines]\n\n[Paste #1 - 21 lines]'
      expect(textarea).toHaveValue(expected)
      expect(window.location.search).toContain('session=replacement-c')
      expect(screen.queryByText('Project chat')).not.toBeInTheDocument()

      rendered.unmount()
      vi.mocked(listSessions).mockResolvedValue([replacement])
      vi.mocked(getSession).mockResolvedValue(replacement)
      vi.mocked(sendMessage).mockResolvedValueOnce(replacement)
      render(<App />)
      expect(await screen.findByLabelText('Message')).toHaveValue(expected)
      expect(sendMessage).toHaveBeenCalledOnce()
      expect(screen.queryByText(/Delivery could not be confirmed/) !== null).toBe(
        outcome === 'rejected',
      )
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() =>
        expect(sendMessage).toHaveBeenLastCalledWith('computer-1', 'replacement-c', {
          content: outcome === 'accepted' ? newer : `${submitted}\n\n${newer}`,
          enqueue: false,
        }),
      )
    },
  )

  it('reloads an unconfirmed paste through offline replacements without a stale completion erasing it', async () => {
    const submitted = Array.from({ length: 21 }, (_, index) => `pending ${index}`).join('\n')
    const replacement = {
      ...session,
      id: 'replacement-c',
      title: 'Replacement C',
      messages: [],
      replacedSessionIds: ['replacement-b', 'session-1'],
    }
    localStorage.setItem('agentic-remote:composer-drafts-v2', JSON.stringify({
      'computer-1:replacement-c': { text: 'Newer replacement draft', pastes: [] },
    }))
    let accept: ((value: ManagedSession) => void) | undefined
    vi.mocked(sendMessage).mockReturnValueOnce(new Promise((resolve) => { accept = resolve }))
    let rendered = render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, { clipboardData: { getData: () => submitted } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    rendered.unmount()

    vi.mocked(listSessions).mockResolvedValue([replacement])
    vi.mocked(getSession).mockResolvedValue(replacement)
    rendered = render(<App />)
    const restored = await screen.findByLabelText('Message')
    const display = '[Paste #1 - 21 lines]\n\nNewer replacement draft'
    expect(restored).toHaveValue(display)
    await act(async () => { accept?.(session) })
    expect(restored).toHaveValue(display)
    expect(screen.getByText(/Delivery could not be confirmed/)).toBeInTheDocument()

    rendered.unmount()
    render(<App />)
    expect(await screen.findByLabelText('Message')).toHaveValue(display)
    expect(sendMessage).toHaveBeenCalledOnce()
    vi.mocked(sendMessage).mockResolvedValueOnce(replacement)
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenLastCalledWith('computer-1', 'replacement-c', {
        content: `${submitted}\n\nNewer replacement draft`,
        enqueue: false,
      }),
    )
  })

  it('does not infer acceptance of a reloaded paste from matching transcript text', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join('\n')
    vi.mocked(sendMessage).mockReturnValueOnce(new Promise(() => {}))
    const rendered = render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    rendered.unmount()
    const withMatchingMessage: ManagedSession = {
      ...session,
      messages: [...session.messages, {
        id: 'matching-but-uncorrelated',
        role: 'user',
        content: pasted,
        createdAt: '2026-09-04T12:00:00.000Z',
      }],
    }
    vi.mocked(listSessions).mockResolvedValue([withMatchingMessage])
    vi.mocked(getSession).mockResolvedValue(withMatchingMessage)
    render(<App />)
    expect(await screen.findByLabelText('Message')).toHaveValue('[Paste #1 - 21 lines]')
    expect(screen.getByText(/Delivery could not be confirmed/)).toBeInTheDocument()
    expect(sendMessage).toHaveBeenCalledOnce()
  })

  it('accepts a collapsed-paste draft after returning from history without restoring it again', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join('\n')
    const rendered = render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
    fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
    fireEvent.keyDown(textarea, { key: 'ArrowDown' })
    expect(textarea).toHaveValue('[Paste #1 - 21 lines]')
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    await waitFor(() => expect(textarea).toHaveValue(''))
    rendered.unmount()

    render(<App />)
    expect(await screen.findByLabelText('Message')).toHaveValue('')
    expect(sendMessage).toHaveBeenCalledOnce()
    expect(screen.queryByText(/Delivery could not be confirmed/)).not.toBeInTheDocument()
  })

  it('keeps the unsent collapsed paste when a recalled literal label is accepted', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join('\n')
    const label = '[Paste #1 - 21 lines]'
    const historical = {
      ...session,
      messages: [{ ...session.messages[0]!, content: label }],
    }
    vi.mocked(listSessions).mockResolvedValue([historical])
    vi.mocked(getSession).mockResolvedValue(historical)
    const rendered = render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
    fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
        content: label,
        enqueue: false,
      }),
    )
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled())
    expect(textarea).toHaveValue(label)
    rendered.unmount()

    render(<App />)
    expect(await screen.findByLabelText('Message')).toHaveValue(label)
    expect(screen.queryByText(/Delivery could not be confirmed/)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenLastCalledWith('computer-1', 'session-1', {
        content: pasted,
        enqueue: false,
      }),
    )
  })

  it('keeps a failure token with an edited unconfirmed paste across reload and replacement', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join('\n')
    const failed = {
      ...session,
      failedPrompt: {
        content: 'Previously recovered prompt',
        failedAt: '2026-09-04T12:00:00.000Z',
      },
    }
    const replacement = {
      ...failed,
      id: 'replacement-c',
      messages: [],
      replacedSessionIds: ['replacement-b', 'session-1'],
    }
    vi.mocked(listSessions).mockResolvedValue([failed])
    vi.mocked(getSession).mockResolvedValue(failed)
    vi.mocked(sendMessage).mockReturnValueOnce(new Promise(() => {}))
    const rendered = render(<App />)
    const textarea = (await screen.findByLabelText('Message')) as HTMLTextAreaElement
    await waitFor(() => expect(textarea).toHaveValue(failed.failedPrompt.content))
    textarea.setSelectionRange(0, textarea.value.length)
    fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    rendered.unmount()

    vi.mocked(listSessions).mockResolvedValue([replacement])
    vi.mocked(getSession).mockResolvedValue(replacement)
    vi.mocked(sendMessage).mockResolvedValueOnce({ ...replacement, failedPrompt: undefined })
    render(<App />)
    const restored = await screen.findByLabelText('Message')
    expect(restored).toHaveValue('[Paste #1 - 21 lines]')
    expect(screen.getByText(/Delivery could not be confirmed/)).toBeInTheDocument()
    fireEvent.change(restored, { target: { value: '[Paste #1 - 21 lines] edited' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenLastCalledWith('computer-1', 'replacement-c', {
        content: `${pasted} edited`,
        enqueue: false,
        acknowledgesFailure: failed.failedPrompt.failedAt,
      }),
    )
    await waitFor(() => expect(restored).toHaveValue(''))
  })

  it('reloads a rejected collapsed-paste command without converting it to a message', async () => {
    const command = `/usage\n${Array.from({ length: 20 }, (_, index) => `line ${index}`).join('\n')}`
    vi.mocked(executeCommand).mockRejectedValueOnce(new Error('Connection lost'))
    const rendered = render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, { clipboardData: { getData: () => command } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await screen.findAllByText('Connection lost')
    expect(textarea).toHaveValue('[Paste #1 - 21 lines]')
    rendered.unmount()

    render(<App />)
    expect(await screen.findByLabelText('Message')).toHaveValue('[Paste #1 - 21 lines]')
    expect(screen.getByText(/Delivery could not be confirmed/)).toBeInTheDocument()
    expect(executeCommand).toHaveBeenCalledOnce()
    expect(sendMessage).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(executeCommand).toHaveBeenLastCalledWith('computer-1', 'session-1', {
        command,
        enqueue: false,
      }),
    )
  })

  it.each(['accepted', 'rejected'])(
    'forgets a pending collapsed paste after local deletion even if its send is later %s',
    async (outcome) => {
      const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join('\n')
      vi.mocked(listSessions).mockResolvedValue([session, secondSession])
      vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
        sessionId === secondSession.id ? secondSession : session,
      )
      let accept: ((value: ManagedSession) => void) | undefined
      let reject: ((reason: Error) => void) | undefined
      vi.mocked(sendMessage).mockReturnValueOnce(new Promise((resolve, fail) => {
        accept = resolve
        reject = fail
      }))
      const rendered = render(<App />)
      const textarea = await screen.findByLabelText('Message')
      fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
      fireEvent.click(sessionAction('Close session'))
      await waitFor(() => expect(screen.queryByText('Project chat')).not.toBeInTheDocument())
      await act(async () => {
        if (outcome === 'accepted') {
          accept?.(session)
        } else {
          reject?.(new Error('Session was deleted'))
        }
      })
      expect(screen.queryByText('Project chat')).not.toBeInTheDocument()
      expect(screen.getByLabelText('Message')).toHaveValue('')
      expect(localStorage.getItem('agentic-remote:composer-drafts-v2')).not.toContain('line 0')
      rendered.unmount()

      vi.mocked(listSessions).mockResolvedValue([secondSession])
      vi.mocked(getSession).mockResolvedValue(secondSession)
      render(<App />)
      expect(await screen.findByLabelText('Message')).toHaveValue('')
      expect(sendMessage).toHaveBeenCalledOnce()
    },
  )

  it('numbers and persists collapsed pastes with their session draft', async () => {
    const first = Array.from({ length: 21 }, (_, index) => `first ${index}`).join(
      '\n',
    )
    const second = Array.from(
      { length: 22 },
      (_, index) => `second ${index}`,
    ).join('\n')
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
      sessionId === secondSession.id ? secondSession : session,
    )
    render(<App />)
    const textarea = (await screen.findByLabelText(
      'Message',
    )) as HTMLTextAreaElement

    fireEvent.paste(textarea, {
      clipboardData: { getData: () => first },
    })
    fireEvent.change(textarea, {
      target: { value: `${textarea.value}\n` },
    })
    textarea.setSelectionRange(textarea.value.length, textarea.value.length)
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => second },
    })

    expect(textarea).toHaveValue(
      '[Paste #1 - 21 lines]\n[Paste #2 - 22 lines]',
    )
    fireEvent.click(screen.getByText('Second chat').closest('button')!)
    await waitFor(() => expect(textarea).toHaveValue(''))
    const firstSessionTitle = screen
      .getAllByText('Project chat')
      .find((element) => element.closest('.session-item'))
    fireEvent.click(firstSessionTitle!.closest('button')!)
    expect(textarea).toHaveValue(
      '[Paste #1 - 21 lines]\n[Paste #2 - 22 lines]',
    )
    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}',
        )['computer-1:session-1'],
      ).toEqual({
        text: '[Paste #1 - 21 lines]\n[Paste #2 - 22 lines]',
        pastes: [
          {
            key: expect.any(String),
            id: 1,
            content: first,
            lineCount: 21,
            start: 0,
          },
          {
            key: expect.any(String),
            id: 2,
            content: second,
            lineCount: 22,
            start: '[Paste #1 - 21 lines]\n'.length,
          },
        ],
      }),
    )
  })

  it('restores a failed long paste as its compact label', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join(
      '\n',
    )
    vi.mocked(sendMessage).mockRejectedValueOnce(new Error('Send failed'))
    render(<App />)
    const textarea = (await screen.findByLabelText(
      'Message',
    )) as HTMLTextAreaElement
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => pasted },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() =>
      expect(textarea).toHaveValue('[Paste #1 - 21 lines]'),
    )
    expect(sendMessage).toHaveBeenCalledWith('computer-1', 'session-1', {
      content: pasted,
      enqueue: false,
    })
  })

  it.each([
    [400, 'Prompt is too long'],
    [409, 'Queue the message while the agent is working'],
  ] as const)('restores a definitively rejected HTTP %i long paste without an uncertainty warning', async (statusCode, message) => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join('\n')
    vi.mocked(sendMessage).mockRejectedValueOnce(
      Object.assign(new Error(message), {
        statusCode,
        uncertainDelivery: false,
      }),
    )
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() => expect(textarea).toHaveValue('[Paste #1 - 21 lines]'))
    expect(screen.getAllByText(message).length).toBeGreaterThan(0)
    expect(screen.queryByText(/Delivery could not be confirmed/)).not.toBeInTheDocument()
  })

  it('carries a collapsed paste to a cleared session replacement', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join(
      '\n',
    )
    render(<App />)
    const textarea = (await screen.findByLabelText(
      'Message',
    )) as HTMLTextAreaElement
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => pasted },
    })

    fireEvent.click(sessionAction('Clear conversation'))
    await waitFor(() =>
      expect(clearConversation).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
      ),
    )
    expect(textarea).toHaveValue('[Paste #1 - 21 lines]')

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith(
        'computer-1',
        'cleared-session',
        {
          content: pasted,
          enqueue: false,
        },
      ),
    )
  })

  it('discards paste metadata when a newer replacement draft wins', async () => {
    const label = '[Paste #1 - 21 lines]'
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join(
      '\n',
    )
    localStorage.setItem(
      'agentic-remote:composer-drafts-v2',
      JSON.stringify({
        'computer-1:session-1': {
          text: label,
          pastes: [
            {
              key: 'paste-1',
              id: 1,
              content: pasted,
              lineCount: 21,
              start: 0,
            },
          ],
        },
        'computer-1:cleared-session': {
          text: 'Newer replacement draft',
          pastes: [],
        },
      }),
    )
    const replacement = {
      ...session,
      id: 'cleared-session',
      messages: [],
      replacedSessionIds: ['session-1'],
    }
    vi.mocked(listSessions).mockResolvedValue([replacement])
    vi.mocked(getSession).mockResolvedValue(replacement)

    render(<App />)

    expect(await screen.findByLabelText('Message')).toHaveValue(
      'Newer replacement draft',
    )
    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}',
        ),
      ).toEqual({
        'computer-1:cleared-session': {
          text: 'Newer replacement draft',
          pastes: [],
        },
      }),
    )
  })

  it('removes paste payloads when another client deletes the session', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join(
      '\n',
    )
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => pasted },
    })

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: 'computer-1',
          sessionId: 'session-1',
        }),
      } as MessageEvent)
    })

    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}',
        ),
      ).toEqual({}),
    )
  })

  it('removes a sent paste after its session is replaced in flight', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join(
      '\n',
    )
    let finishSend: ((session: ManagedSession) => void) | undefined
    vi.mocked(sendMessage).mockReturnValueOnce(
      new Promise((resolve) => {
        finishSend = resolve
      }),
    )
    const replacement = {
      ...session,
      id: 'session-replacement',
      messages: [],
      replacedSessionIds: ['session-1'],
    }
    vi.mocked(getSession).mockResolvedValue(replacement)
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => pasted },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: 'computer-1',
          sessionId: 'session-1',
          replacedBy: replacement.id,
        }),
      } as MessageEvent)
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: replacement }),
      } as MessageEvent)
    })
    await act(async () => {
      finishSend?.(replacement)
    })

    await waitFor(() =>
      expect(
        JSON.stringify(
          JSON.parse(
            localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}',
          ),
        ),
      ).not.toContain(pasted),
    )
  })

  it('does not restore a failed paste after the session is deleted in flight', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join(
      '\n',
    )
    let failSend: ((reason: Error) => void) | undefined
    vi.mocked(sendMessage).mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        failSend = reject
      }),
    )
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => pasted },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: 'computer-1',
          sessionId: 'session-1',
        }),
      } as MessageEvent)
    })
    failSend?.(new Error('Send failed'))

    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}',
        ),
      ).toEqual({}),
    )
  })

  it('restores a failed paste beside a replacement draft without ID collisions', async () => {
    const submittedFirst = Array.from(
      { length: 21 },
      (_, index) => `submitted first ${index}`,
    ).join('\n')
    const submittedSecond = Array.from(
      { length: 21 },
      (_, index) => `submitted second ${index}`,
    ).join('\n')
    const existing = Array.from(
      { length: 21 },
      (_, index) => `existing ${index}`,
    ).join('\n')
    const label = '[Paste #1 - 21 lines]'
    localStorage.setItem(
      'agentic-remote:composer-drafts-v2',
      JSON.stringify({
        'computer-1:session-replacement': {
          text: label,
          pastes: [
            {
              key: 'replacement-paste',
              id: 1,
              content: existing,
              lineCount: 21,
              start: 0,
            },
          ],
        },
      }),
    )
    let failSend: ((reason: Error) => void) | undefined
    vi.mocked(sendMessage)
      .mockReturnValueOnce(
        new Promise((_resolve, reject) => {
          failSend = reject
        }),
      )
      .mockResolvedValueOnce({
        ...session,
        id: 'session-replacement',
        messages: [],
      })
    const replacement = {
      ...session,
      id: 'session-replacement',
      messages: [],
      replacedSessionIds: ['session-1'],
    }
    vi.mocked(getSession).mockResolvedValue(replacement)
    render(<App />)
    const textarea = (await screen.findByLabelText(
      'Message',
    )) as HTMLTextAreaElement
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => submittedFirst },
    })
    textarea.setSelectionRange(0, 0)
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => submittedSecond },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: 'computer-1',
          sessionId: 'session-1',
          replacedBy: replacement.id,
        }),
      } as MessageEvent)
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: replacement }),
      } as MessageEvent)
    })
    failSend?.(new Error('Send failed'))

    await waitFor(() =>
      expect(textarea).toHaveValue(
        '[Paste #2 - 21 lines][Paste #3 - 21 lines]\n\n' +
          '[Paste #1 - 21 lines]',
      ),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenLastCalledWith(
        'computer-1',
        'session-replacement',
        {
          content: `${submittedSecond}${submittedFirst}\n\n${existing}`,
          enqueue: false,
        },
      ),
    )
  })

  it('drops a paste when a failed clear confirms the session was deleted', async () => {
    const pasted = Array.from({ length: 21 }, (_, index) => `line ${index}`).join(
      '\n',
    )
    let failClear: ((reason: Error) => void) | undefined
    vi.mocked(clearConversation).mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        failClear = reject
      }),
    )
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.paste(textarea, {
      clipboardData: { getData: () => pasted },
    })
    fireEvent.click(sessionAction('Clear conversation'))
    await waitFor(() => expect(clearConversation).toHaveBeenCalledOnce())
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.removed',
          computerId: 'computer-1',
          sessionId: 'session-1',
        }),
      } as MessageEvent)
    })
    failClear?.(new Error('Response lost'))

    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}',
        ),
      ).toEqual({}),
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

  it('renders exact safe breaks in conversation Markdown without executing raw HTML', async () => {
    const marked = { ...session, messages: [{
      id: 'safe-break-message', role: 'assistant' as const,
      content: 'first<br>second<br/>third<br />fourth\n\n<script>bad()</script>',
      createdAt: '2026-07-22T00:00:02.000Z',
    }] }
    vi.mocked(listSessions).mockResolvedValue([marked])
    vi.mocked(getSession).mockResolvedValue(marked)
    render(<App />)
    await screen.findByLabelText('Message')
    await waitFor(() => expect(document.querySelectorAll('.message--assistant .message__content br')).toHaveLength(3))
    expect(document.querySelector('.message--assistant script')).toBeNull()
  })

  it.each(['workspace', 'knowledge'] as const)(
    'renders safe breaks in the %s viewer and leaves Source unchanged',
    async (surface) => {
      const content = '# First<br>second\n\nBefore<br/>after<br />last\n\n' +
        'Inert <img src=x onerror=bad()>\n\n<script>bad()</script>\n\n```html\n<br>\n```'
      const file: WorkspaceFile = {
        name: 'README.md', path: 'README.md', kind: 'markdown',
        mimeType: 'text/markdown', size: content.length, content,
      }
      vi.mocked(readWorkspaceFile).mockResolvedValue(file)
      vi.mocked(readKnowledgeFile).mockResolvedValue(file)
      mockKnowledgeRoots([knowledgeRoot])
      vi.mocked(listKnowledgeEntries).mockResolvedValue({
        path: '.', entries: [{ name: 'README.md', path: 'README.md', kind: 'markdown' }],
      })
      render(<App />)
      if (surface === 'workspace') {
        fireEvent.click(await screen.findByRole('button', { name: 'Browse current session folder' }))
        fireEvent.click(await screen.findByRole('button', { name: /README.md/ }))
      } else {
        fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
        fireEvent.click(await screen.findByRole('treeitem', { name: 'README.md' }))
      }
      const heading = await screen.findByRole('heading', { name: /^First\s*second$/ })
      expect(heading).toHaveAttribute('id', 'first-second')
      const preview = heading.closest('.workspace-preview__content')!
      expect(preview.querySelectorAll('br')).toHaveLength(3)
      expect(preview.querySelector('script, img, [onerror]')).toBeNull()
      expect(preview.querySelector('pre code')?.textContent).toBe('<br>\n')
      fireEvent.click(screen.getByRole('button', { name: 'Source' }))
      expect(document.querySelector('.workspace-preview__content > pre')?.textContent).toBe(content)
      expect(document.querySelector('.workspace-preview__content br')).toBeNull()
    },
  )

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

    fireEvent.click(screen.getByRole('button', { name: 'Source' }))
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
    vi.mocked(uploadSessionFile).mockResolvedValueOnce({
      name: 'dashboard-query.kql',
      path: '/private/uploads/dashboard-query.kql',
      size: 21,
    })
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    const attachment = screen.getByLabelText('File attachment')
    expect(attachment.getAttribute('accept')?.split(',')).toContain('.kql')
    const file = new File(['StormEvents | take 10'], 'dashboard-query.kql', {
      type: 'text/plain',
    })

    fireEvent.change(attachment, {
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
        'Attached file: `/private/uploads/dashboard-query.kql`',
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

  it('requests guarded terminal replacement in the original tmux send', async () => {
    const terminalSession = {
      ...session,
      executionMode: 'tmux' as const,
      provider: 'copilot' as const,
    }
    vi.mocked(listSessions).mockResolvedValue([terminalSession])
    vi.mocked(getSession).mockResolvedValue(terminalSession)
    vi.mocked(sendMessage).mockResolvedValueOnce(terminalSession)
    const confirm = vi.spyOn(window, 'confirm')
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Send the preserved app draft' } })

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenLastCalledWith(
        'computer-1',
        'session-1',
        {
          acknowledgesFailure: undefined,
          content: 'Send the preserved app draft',
          enqueue: false,
          replaceTerminalDraft: true,
        },
      ),
    )
    expect(sendMessage).toHaveBeenCalledOnce()
    expect(confirm).not.toHaveBeenCalled()
    expect(screen.queryByText('Terminal text is blocking this draft')).toBeNull()
    expect(textarea).toHaveValue('')
  })

  it('does not request terminal replacement for running steering or allowed commands', async () => {
    const running = {
      ...session,
      status: 'running' as const,
      executionMode: 'tmux' as const,
      provider: 'copilot' as const,
    }
    vi.mocked(listSessions).mockResolvedValue([running])
    vi.mocked(getSession).mockResolvedValue(running)
    vi.mocked(sendMessage).mockResolvedValue(running)
    vi.mocked(executeCommand).mockResolvedValue(running)
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    await waitFor(() => expect(listCommands).toHaveBeenCalled())

    fireEvent.change(textarea, { target: { value: 'Steer the current response' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        {
          acknowledgesFailure: undefined,
          content: 'Steer the current response',
          enqueue: false,
        },
      ),
    )

    await waitFor(() => expect(textarea).not.toBeDisabled())
    fireEvent.change(textarea, { target: { value: '/usage' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await waitFor(() =>
      expect(executeCommand).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        {
          acknowledgesFailure: undefined,
          command: '/usage',
          enqueue: false,
        },
      ),
    )
  })

  describe('a steer the terminal took but has not logged yet', () => {
    const running: ManagedSession = {
      ...session,
      status: 'running',
      executionMode: 'tmux',
      provider: 'copilot',
    }
    const steer = 'End the story with the word mango'
    const pendingBubble = () =>
      screen.queryByRole('article', { name: 'Your message, pending in the terminal' })
    const emit = (event: unknown) => act(() => MockWebSocket.instances.at(-1)?.onmessage?.({
      data: JSON.stringify(event),
    } as MessageEvent))

    it('shows as sent, marked pending, until the transcript has it', async () => {
      vi.mocked(listSessions).mockResolvedValue([running])
      vi.mocked(getSession).mockResolvedValue(running)
      vi.mocked(sendMessage).mockResolvedValue(running)
      render(<App />)
      const textarea = await screen.findByLabelText('Message')
      await act(async () => {})

      fireEvent.change(textarea, { target: { value: steer } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

      const bubble = await screen.findByRole('article', {
        name: 'Your message, pending in the terminal',
      })
      expect(bubble).toHaveTextContent(steer)
      expect(bubble).toHaveTextContent('Pending')
      expect(textarea).toHaveValue('')
      expect(sendMessage).toHaveBeenCalledOnce()

      emit({
        type: 'session.upserted',
        session: {
          ...running,
          updatedAt: new Date().toISOString(),
          messages: [
            ...running.messages,
            { id: 'message-4', role: 'user', content: steer, createdAt: new Date().toISOString() },
          ],
        },
      })
      await waitFor(() => expect(pendingBubble()).toBeNull())
      expect(screen.getAllByText(steer)).toHaveLength(1)
      expect(sendMessage).toHaveBeenCalledOnce()
    })

    it('uses the transcript stack spacing before any message has been logged', async () => {
      const emptyRunning = { ...running, messages: [] }
      vi.mocked(listSessions).mockResolvedValue([emptyRunning])
      vi.mocked(getSession).mockResolvedValue(emptyRunning)
      vi.mocked(sendMessage).mockResolvedValue(emptyRunning)
      render(<App />)
      const textarea = await screen.findByLabelText('Message')
      await act(async () => {})

      fireEvent.change(textarea, { target: { value: steer } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

      const bubble = await screen.findByRole('article', {
        name: 'Your message, pending in the terminal',
      })
      expect(bubble.parentElement).toHaveClass('message-stack')
      expect(
        screen.queryByRole('heading', { name: 'What should we work on?' }),
      ).not.toBeInTheDocument()
    })

    it('is shown for an accepted steer while the same words already wait in the queue', async () => {
      const waiting = { id: 'q0', content: steer, createdAt: new Date().toISOString() }
      const queued = { ...running, queuedPrompts: [waiting] }
      vi.mocked(listSessions).mockResolvedValue([queued])
      vi.mocked(getSession).mockResolvedValue(queued)
      vi.mocked(sendMessage).mockResolvedValue(queued)
      render(<App />)
      const textarea = await screen.findByLabelText('Message')
      await act(async () => {})

      fireEvent.change(textarea, { target: { value: steer } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      expect(await screen.findByRole('article', {
        name: 'Your message, pending in the terminal',
      })).toHaveTextContent(steer)
    })

    it('is not shown for a send the app queued instead', async () => {
      vi.mocked(listSessions).mockResolvedValue([running])
      vi.mocked(getSession).mockResolvedValue(running)
      vi.mocked(sendMessage).mockResolvedValue({
        ...running,
        queuedPrompts: [{ id: 'q1', content: steer, createdAt: new Date().toISOString() }],
      })
      render(<App />)
      const textarea = await screen.findByLabelText('Message')
      await act(async () => {})

      fireEvent.change(textarea, { target: { value: steer } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
      await waitFor(() => expect(textarea).not.toBeDisabled())
      expect(pendingBubble()).toBeNull()
    })

    it('labels a steer the busy terminal will take as soon as it can', async () => {
      vi.mocked(listSessions).mockResolvedValue([running])
      vi.mocked(getSession).mockResolvedValue(running)
      vi.mocked(sendMessage).mockResolvedValue({
        ...running,
        queuedPrompts: [{ id: 'q1', content: steer, createdAt: new Date().toISOString(), steer: true }],
      })
      render(<App />)
      const textarea = await screen.findByLabelText('Message')
      await act(async () => {})

      fireEvent.change(textarea, { target: { value: steer } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      const label = await screen.findByTitle('Typed into the running turn as soon as the terminal is ready')
      expect(label).toHaveTextContent('Steer')
      expect(label.parentElement).toHaveTextContent(steer)
    })

    it('is not shown for a failed send, which goes back to the composer', async () => {
      vi.mocked(listSessions).mockResolvedValue([running])
      vi.mocked(getSession).mockResolvedValue(running)
      vi.mocked(sendMessage).mockRejectedValue(
        Object.assign(new Error('The terminal is showing a full-screen view.'), { status: 409 }),
      )
      render(<App />)
      const textarea = await screen.findByLabelText('Message')
      await act(async () => {})

      fireEvent.change(textarea, { target: { value: steer } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() => expect(textarea).toHaveValue(steer))
      expect(pendingBubble()).toBeNull()
    })
  })

  it('sends a recovered prompt with guarded replacement and its current token', async () => {
    const oldToken = 'resend:old-terminal-conflict'
    const content = 'Recovered prompt blocked by stale tmux text'
    const failed: ManagedSession = {
      ...session,
      executionMode: 'tmux',
      provider: 'copilot',
      messages: [],
      failedPrompt: {
        content,
        failedAt: oldToken,
        uncertain: true,
      },
    }
    vi.mocked(listSessions).mockResolvedValue([failed])
    vi.mocked(getSession).mockResolvedValue(failed)
    vi.mocked(sendMessage).mockResolvedValueOnce({
      ...failed,
      failedPrompt: undefined,
    })
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    await waitFor(() => expect(textarea).toHaveValue(content))

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() =>
      expect(sendMessage).toHaveBeenLastCalledWith(
        'computer-1',
        'session-1',
        {
          acknowledgesFailure: oldToken,
          content,
          enqueue: false,
          replaceTerminalDraft: true,
        },
      ),
    )
    expect(sendMessage).toHaveBeenCalledOnce()
  })

  it('uses the refusal token after a guarded replacement fails', async () => {
    const oldToken = 'resend:old-receiptless-replacement'
    const freshToken = 'resend:fresh-receiptless-replacement'
    const content = 'Recovered prompt whose replacement is refused'
    const failed: ManagedSession = {
      ...session,
      executionMode: 'tmux',
      provider: 'copilot',
      messages: [],
      failedPrompt: {
        content,
        failedAt: oldToken,
        uncertain: true,
      },
    }
    vi.mocked(listSessions).mockResolvedValue([failed])
    vi.mocked(getSession).mockResolvedValue(failed)
    vi.mocked(sendMessage)
      .mockRejectedValueOnce(Object.assign(
        new Error('The terminal changed before replacement'),
        {
          statusCode: 409,
          terminalDraftConflict: true,
          uncertainDelivery: false,
          submission: {
            sessionId: session.id,
            failedAt: freshToken,
            accepted: false,
          },
        },
      ))
      .mockResolvedValueOnce({
        ...failed,
        failedPrompt: undefined,
      })
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    await waitFor(() => expect(textarea).toHaveValue(content))

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(textarea).toHaveValue(content))
    expect(sendMessage).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() =>
      expect(sendMessage).toHaveBeenLastCalledWith(
        'computer-1',
        'session-1',
        {
          acknowledgesFailure: freshToken,
          content,
          enqueue: false,
          replaceTerminalDraft: true,
        },
      ),
    )
  })

  it('restores the draft and shows the guarded replacement refusal', async () => {
    const terminalSession = {
      ...session,
      executionMode: 'tmux' as const,
      provider: 'copilot' as const,
    }
    vi.mocked(listSessions).mockResolvedValue([terminalSession])
    vi.mocked(getSession).mockResolvedValue(terminalSession)
    const changed = Object.assign(
      new Error(
        'New terminal text appeared before the app draft could be sent. Nothing new was pasted.',
      ),
      {
        statusCode: 409,
        terminalDraftConflict: true,
        uncertainDelivery: false,
      },
    )
    vi.mocked(sendMessage).mockRejectedValueOnce(changed)
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Keep this draft visible' } })

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(
      (await screen.findAllByText(changed.message))
        .some((message) => message.closest('.error-banner')),
    ).toBe(true)
    expect(textarea).toHaveValue('Keep this draft visible')
    expect(sendMessage).toHaveBeenCalledOnce()
    expect(sendMessage).toHaveBeenCalledWith(
      'computer-1',
      'session-1',
      {
        acknowledgesFailure: undefined,
        content: 'Keep this draft visible',
        enqueue: false,
        replaceTerminalDraft: true,
      },
    )
    expect(screen.queryByText('Terminal text is blocking this draft')).toBeNull()
  })

  it('does not auto-replace a conflict with uncertain delivery', async () => {
    const terminalSession = {
      ...session,
      executionMode: 'tmux' as const,
      provider: 'copilot' as const,
    }
    vi.mocked(listSessions).mockResolvedValue([terminalSession])
    vi.mocked(getSession).mockResolvedValue(terminalSession)
    vi.mocked(sendMessage).mockRejectedValueOnce(Object.assign(
      new Error('The terminal request outcome is unknown'),
      {
        statusCode: 409,
        terminalDraftConflict: true,
        uncertainDelivery: true,
      },
    ))
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Keep this uncertain draft' } })

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() => expect(textarea).toHaveValue('Keep this uncertain draft'))
    expect(sendMessage).toHaveBeenCalledOnce()
    expect(sendMessage).toHaveBeenCalledWith(
      'computer-1',
      'session-1',
      {
        acknowledgesFailure: undefined,
        content: 'Keep this uncertain draft',
        enqueue: false,
        replaceTerminalDraft: true,
      },
    )
    expect(screen.getByText(/Delivery could not be confirmed/)).toBeVisible()
  })

  it('does not auto-replace a queued send', async () => {
    const running = {
      ...session,
      status: 'running' as const,
      executionMode: 'tmux' as const,
      provider: 'copilot' as const,
    }
    vi.mocked(listSessions).mockResolvedValue([running])
    vi.mocked(getSession).mockResolvedValue(running)
    vi.mocked(sendMessage).mockRejectedValueOnce(Object.assign(
      new Error('Terminal text is blocking queued delivery'),
      {
        statusCode: 409,
        terminalDraftConflict: true,
        uncertainDelivery: false,
      },
    ))
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Queue without clearing tmux' } })

    fireEvent.click(screen.getByRole('button', { name: 'Queue message' }))

    await waitFor(() => expect(textarea).toHaveValue('Queue without clearing tmux'))
    expect(sendMessage).toHaveBeenCalledOnce()
    expect(sendMessage).toHaveBeenCalledWith(
      'computer-1',
      'session-1',
      { content: 'Queue without clearing tmux', enqueue: true },
    )
  })

  it.each(['direct', 'collapsed paste'] as const)(
    'keeps an app-local command local without a command catalog from a %s',
    async (source) => {
    vi.mocked(listCommands).mockRejectedValueOnce(new Error('Catalog unavailable'))
    render(<App />)
    const textarea = await screen.findByLabelText('Message')

    if (source === 'direct') {
      fireEvent.change(textarea, { target: { value: '/statusline' } })
    } else {
      fireEvent.paste(textarea, {
        clipboardData: {
          getData: () => [
            '/statusline',
            ...Array.from({ length: 20 }, (_, index) => `line ${index}`),
          ].join('\n'),
        },
      })
      expect(textarea).toHaveValue('[Paste #1 - 21 lines]')
    }

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(
      await screen.findByRole('dialog', { name: 'Status line' }),
    ).toBeInTheDocument()
    expect(sendMessage).not.toHaveBeenCalled()
    expect(executeCommand).not.toHaveBeenCalled()
    },
  )

  it('keeps interrupted history readable and requires explicit same-ID reopen before writing', async () => {
    const interrupted = {
      ...session, status: 'error' as const,
      interruption: { detectedAt: '2026-10-19T06:52:00Z', previousStatus: 'running' as const },
    }
    vi.mocked(listSessions).mockResolvedValue([interrupted])
    vi.mocked(getSession).mockResolvedValue(interrupted)
    vi.mocked(activateSession).mockResolvedValue(session)
    render(<App />)
    expect(await screen.findByText('Hello agent')).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toBeDisabled()
    expect(listCommands).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Reopen session' }))
    await waitFor(() => expect(screen.getByLabelText('Message')).toBeEnabled())
    expect(activateSession).toHaveBeenCalledWith('computer-1', 'session-1')
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('removes an archived row without deleting the selected transcript or draft', async () => {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    vi.mocked(activateSession).mockResolvedValue(session)
    render(<App />)
    const composer = await screen.findByLabelText('Message')
    fireEvent.change(composer, { target: { value: 'Draft for tomorrow' } })
    await act(async () => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: { ...session, isOpen: false, archivedAt: '2026-10-19T06:52:00Z' },
        }),
      } as MessageEvent)
    })
    expect(screen.queryByRole('button', { name: /^Project chat,/ })).toBeNull()
    expect(screen.getByText('Hello agent')).toBeInTheDocument()
    expect(composer).toHaveValue('Draft for tomorrow')
    expect(composer).toBeDisabled()
    const archived = { ...session, isOpen: false, archivedAt: '2026-10-19T06:52:00Z' }
    vi.mocked(getSession).mockResolvedValue(archived)
    vi.mocked(listSessionListing).mockResolvedValue({ sessions: [], answeredComputerIds: [computer.id] })
    const beforeRefresh = vi.mocked(listSessionListing).mock.calls.length
    fireEvent(document, new Event('visibilitychange'))
    await waitFor(() => expect(listSessionListing).toHaveBeenCalledTimes(beforeRefresh + 1))
    await waitFor(() => expect(getSession).toHaveBeenLastCalledWith(computer.id, session.id))
    expect(screen.getByText('Hello agent')).toBeInTheDocument()
    expect(composer).toHaveValue('Draft for tomorrow')
    expect(screen.queryByRole('button', { name: /^Project chat,/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Reopen session' }))
    await waitFor(() => expect(composer).toBeEnabled())
    expect(composer).toHaveValue('Draft for tomorrow')
    expect(deleteSession).not.toHaveBeenCalled()
  })

  it('drops an archived selection whose deletion event was missed when the authoritative refresh cannot find it', async () => {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible')
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    render(<App />)
    await screen.findByText('Hello agent')
    await act(async () => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: { ...session, isOpen: false, archivedAt: '2026-10-19T06:52:00Z' },
        }),
      } as MessageEvent)
    })
    expect(screen.getByText('Hello agent')).toBeInTheDocument()
    // Deleted on another device while this browser's socket missed the event.
    vi.mocked(getSession).mockImplementation(async (_computerId, id) => {
      if (id === session.id) throw new SubmissionError('Session not found', 404)
      return secondSession
    })
    vi.mocked(listSessionListing).mockResolvedValue({ sessions: [secondSession], answeredComputerIds: [computer.id] })
    fireEvent(document, new Event('visibilitychange'))
    await waitFor(() => expect(screen.queryByText('Hello agent')).toBeNull())
    await waitFor(() => expect(screen.getByRole('button', { name: /^Second chat,/ })).toHaveAttribute('aria-current', 'page'))
    expect(screen.queryByText('Session not found')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Reopen session' })).toBeNull()
  })

  it.each([
    ['archived', { isOpen: false, archivedAt: '2026-10-19T06:52:00Z' }],
    ['interrupted', { status: 'error' as const, interruption: { detectedAt: '2026-10-19T06:52:00Z', previousStatus: 'running' as const } }],
  ])('keeps restart and runtime moves unavailable on an %s session until it is reopened', async (_label, retained) => {
    const kept = { ...session, executionMode: 'sdk' as const, ...retained }
    vi.mocked(listSessions).mockResolvedValue([kept])
    vi.mocked(getSession).mockResolvedValue(kept)
    render(<App />)
    await screen.findByText('Hello agent')
    openSessionActions()
    for (const name of ['Restart session', 'Move session to tmux']) {
      expect(screen.getByRole('button', { name })).toBeDisabled()
    }
    expect(restartSession).not.toHaveBeenCalled()
  })

  it.each([
    ['archived', { isOpen: false, archivedAt: '2026-10-19T06:52:00Z' }],
    ['interrupted', { status: 'error' as const, interruption: { detectedAt: '2026-10-19T06:52:00Z', previousStatus: 'running' as const } }],
  ])('keeps queued work read-only on an %s session until it is reopened', async (_label, retained) => {
    const kept = {
      ...session, ...retained,
      queuedPrompts: [
        { id: 'first', content: 'First queued', createdAt: '2026-10-19T06:50:00Z' },
        { id: 'second', content: 'Second queued', createdAt: '2026-10-19T06:51:00Z' },
      ],
      queuedCount: 2,
    }
    vi.mocked(listSessions).mockResolvedValue([kept])
    vi.mocked(getSession).mockResolvedValue(kept)
    render(<App />)
    await screen.findByText('First queued')
    for (const index of [1, 2]) {
      expect(screen.getByRole('button', { name: `Edit queued prompt ${index}` })).toBeDisabled()
      expect(screen.getByRole('button', { name: `Remove queued prompt ${index}` })).toBeDisabled()
      expect(screen.getByRole('button', { name: `Reorder queued prompt ${index}` })).toHaveAttribute('aria-disabled', 'true')
    }
    fireEvent.click(screen.getByRole('button', { name: 'Remove queued prompt 1' }))
    expect(removeQueuedPrompt).not.toHaveBeenCalled()
    expect(updateQueuedPrompt).not.toHaveBeenCalled()
    expect(reorderQueuedPrompts).not.toHaveBeenCalled()
  })

  it('keeps the open transcript when a node resync sends a transcript-less summary', async () => {
    render(<App />)
    await screen.findByText('Hello agent')
    await act(async () => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted', summary: true,
          session: { ...session, title: 'Renamed while offline', messages: [] },
        }),
      } as MessageEvent)
    })
    expect(await screen.findAllByText('Renamed while offline')).not.toHaveLength(0)
    expect(screen.getByText('Hello agent')).toBeInTheDocument()
  })

  it('saves retention on the owning computer and closes the retention dialog with Escape', async () => {
    vi.mocked(listComputers).mockResolvedValue([{
      ...computer, providers: computer.providers?.map((provider) => ({ ...provider, supportsSessionRetention: true })),
    }])
    vi.mocked(configureRetention).mockResolvedValue({ ...session, retention: { pinned: true } })
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session actions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Session retention' }))
    const dialog = await screen.findByRole('dialog', { name: 'Session retention' })
    fireEvent.click(within(dialog).getByRole('checkbox', { name: 'Keep for review' }))
    await waitFor(() => expect(within(dialog).getByRole('checkbox')).toBeChecked())
    expect(configureRetention).toHaveBeenCalledWith('computer-1', 'session-1', { pinned: true })
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Session retention' })).toBeNull())
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
      sessionAction('Mute session notifications'),
    )

    await waitFor(() =>
      expect(setSessionNotificationsMuted).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        true,
      ),
    )
    expect(
      sessionAction('Unmute session notifications'),
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

  it('closes the new-session sheet and shows a pending session while creating', async () => {
    let finishCreation: ((created: ManagedSession) => void) | undefined
    vi.mocked(createSession).mockReturnValueOnce(
      new Promise((resolve) => {
        finishCreation = resolve
      }),
    )
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))

    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Choose a folder' }),
      ).not.toBeInTheDocument(),
    )
    const pending = screen.getByRole('status', {
      name: 'Creating GitHub Copilot session on development in ~',
    })
    expect(pending).toHaveTextContent('Copilot')
    expect(pending).toHaveTextContent('tmux')
    expect(pending).toHaveTextContent('Creating session')
    expect(pending.querySelectorAll('.session-creation-dot')).toHaveLength(3)

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.change(screen.getByLabelText('Agent provider'), {
      target: { value: 'claude' },
    })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create session' })).toBeEnabled(),
    )

    await act(async () => {
      finishCreation?.({
        ...session,
        id: 'created-session',
        title: 'Fresh session',
      })
      await Promise.resolve()
    })

    expect(
      screen.getByRole('dialog', { name: 'Choose a folder' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Agent provider')).toHaveValue('claude')
    expect(screen.getByRole('button', { name: 'Create session' })).toBeEnabled()
    expect(screen.getByRole('button', { name: /^Project chat,/ }))
      .toHaveAttribute('aria-current', 'page')
    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() =>
      expect(
        screen.queryByRole('status', {
          name: 'Creating GitHub Copilot session on development in ~',
        }),
      ).not.toBeInTheDocument(),
    )
    expect(screen.getAllByText('Fresh session').length).toBeGreaterThan(0)
  })

  it('keeps a pending session in the place its created session takes', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    let finishCreation: ((created: ManagedSession) => void) | undefined
    vi.mocked(createSession).mockReturnValueOnce(
      new Promise((resolve) => {
        finishCreation = resolve
      }),
    )
    render(<App />)
    await screen.findByRole('button', { name: /^Second chat,/ })
    const rows = () => {
      const lane = screen.getByRole('region', { name: 'development' })
      return [
        ...lane.querySelectorAll('.computer-session-group__sessions > *'),
      ].map((row) =>
        row.getAttribute('role') === 'status'
          ? 'pending'
          : row.querySelector('.session-item__text strong')?.textContent,
      )
    }

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await screen.findByRole('status', {
      name: 'Creating GitHub Copilot session on development in ~',
    })
    const before = rows()
    expect(before.at(-1)).toBe('pending')
    expect(before).toHaveLength(3)

    await act(async () => {
      finishCreation?.({
        ...session,
        id: 'created-session',
        title: 'Fresh session',
        updatedAt: '2026-07-23T00:00:00.000Z',
        messages: [],
      })
      await Promise.resolve()
    })

    await waitFor(() => expect(rows()).toEqual([...before.slice(0, -1), 'Fresh session']))
  })

  it('keeps the newer selection when overlapping creations finish out of order', async () => {
    const worker = { ...computer, id: 'computer-2', name: 'worker-node', isLocal: false }
    vi.mocked(listComputers).mockResolvedValue([computer, worker])
    let finishOlder: ((created: ManagedSession) => void) | undefined
    let finishNewer: ((created: ManagedSession) => void) | undefined
    vi.mocked(createSession)
      .mockReturnValueOnce(new Promise((resolve) => {
        finishOlder = resolve
      }))
      .mockReturnValueOnce(new Promise((resolve) => {
        finishNewer = resolve
      }))
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await screen.findByRole('status', {
      name: 'Creating GitHub Copilot session on development in ~',
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.change(screen.getAllByLabelText('Computer')[0], {
      target: { value: 'computer-2' },
    })
    fireEvent.change(screen.getByLabelText('Agent provider'), {
      target: { value: 'claude' },
    })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create session' })).toBeEnabled(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await screen.findByRole('status', {
      name: 'Creating Claude Agent session on worker-node in ~',
    })
    await waitFor(() => expect(createSession).toHaveBeenCalledTimes(2))

    await act(async () => {
      finishNewer?.({
        ...session,
        id: 'newer-created-session',
        computerId: worker.id,
        computerName: worker.name,
        provider: 'claude',
        executionMode: 'sdk',
        title: 'Newer session',
      })
      await Promise.resolve()
    })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /^Newer session,/ }))
        .toHaveAttribute('aria-current', 'page'),
    )

    await act(async () => {
      finishOlder?.({
        ...session,
        id: 'older-created-session',
        title: 'Older session',
      })
      await Promise.resolve()
    })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /^Older session,/ }))
        .toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: /^Newer session,/ }))
      .toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: /^Older session,/ }))
      .not.toHaveAttribute('aria-current')
  })

  it('creates sessions on one computer in submission order, each in its place', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    const finishers: ((created: ManagedSession) => void)[] = []
    vi.mocked(createSession).mockImplementation(() =>
      new Promise((resolve) => {
        finishers.push(resolve)
      }),
    )
    render(<App />)
    await screen.findByRole('button', { name: /^Second chat,/ })
    const rows = () => [
      ...screen.getByRole('region', { name: 'development' })
        .querySelectorAll('.computer-session-group__sessions > *'),
    ].map((row) =>
      row.getAttribute('role') === 'status'
        ? row.getAttribute('aria-label')
        : row.querySelector('.session-item__text strong')?.textContent,
    )
    const create = async (provider: string, label: string) => {
      fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
      fireEvent.change(screen.getByLabelText('Agent provider'), {
        target: { value: provider },
      })
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Create session' })).toBeEnabled(),
      )
      fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
      await screen.findByRole('status', { name: label })
    }
    const first = 'Creating GitHub Copilot session on development in ~'
    const second = 'Creating Claude Agent session on development in ~'
    await create('copilot', first)
    await create('claude', second)
    expect(createSession).toHaveBeenCalledOnce()
    const existing = rows().slice(0, 2)
    expect(rows()).toEqual([...existing, first, second])

    await act(async () => {
      finishers[0]({ ...session, id: 'first-created', title: 'First new', updatedAt: '2026-07-23T00:00:00.000Z', messages: [] })
      await Promise.resolve()
    })
    await waitFor(() => expect(createSession).toHaveBeenCalledTimes(2))
    expect(rows()).toEqual([...existing, 'First new', second])

    await act(async () => {
      finishers[1]({
        ...session, id: 'second-created', title: 'Second new', provider: 'claude',
        executionMode: 'sdk', updatedAt: '2026-07-23T00:00:05.000Z', messages: [],
      })
      await Promise.resolve()
    })
    await waitFor(() => expect(rows()).toEqual([...existing, 'First new', 'Second new']))
  })

  it('sends the next creation on a computer once the earlier one fails', async () => {
    let failFirst: ((error: Error) => void) | undefined
    vi.mocked(createSession)
      .mockReturnValueOnce(new Promise((_resolve, reject) => {
        failFirst = reject
      }))
      .mockResolvedValueOnce({ ...session, id: 'second-created', title: 'Second new', messages: [] })
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await screen.findByRole('status', {
      name: 'Creating GitHub Copilot session on development in ~',
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.change(screen.getByLabelText('Agent provider'), {
      target: { value: 'claude' },
    })
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create session' })).toBeEnabled(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await screen.findByRole('status', {
      name: 'Creating Claude Agent session on development in ~',
    })
    expect(createSession).toHaveBeenCalledOnce()

    await act(async () => {
      failFirst?.(new Error('Folder is not available'))
      await Promise.resolve()
    })

    await waitFor(() => expect(createSession).toHaveBeenCalledTimes(2))
    expect(await screen.findByText('Folder is not available')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getAllByText('Second new').length).toBeGreaterThan(0),
    )
  })

  it('shows a failed creation inside a reopened new-session sheet', async () => {
    let failCreation: ((error: Error) => void) | undefined
    vi.mocked(createSession).mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        failCreation = reject
      }),
    )
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await screen.findByRole('status', {
      name: 'Creating GitHub Copilot session on development in ~',
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.change(screen.getByLabelText('Agent provider'), {
      target: { value: 'claude' },
    })

    await act(async () => {
      failCreation?.(new Error('Session creation failed'))
      await Promise.resolve()
    })

    const dialog = screen.getByRole('dialog', { name: 'Choose a folder' })
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'Session creation failed',
    )
    expect(screen.getByLabelText('Agent provider')).toHaveValue('claude')
    expect(screen.getAllByRole('alert')).toHaveLength(1)
  })

  it('shows a failed creation inside the active 390px sessions drawer', async () => {
    const originalWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    })
    let failCreation: ((error: Error) => void) | undefined
    vi.mocked(createSession).mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        failCreation = reject
      }),
    )
    try {
      render(<App />)
      await screen.findAllByText('Project chat')

      fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
      fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
      await screen.findByRole('status', {
        name: 'Creating GitHub Copilot session on development in ~',
      })

      await act(async () => {
        failCreation?.(new Error('Session creation failed'))
        await Promise.resolve()
      })

      const sidebar = document.querySelector('.sidebar--open')
      expect(sidebar).not.toBeNull()
      expect(within(sidebar as HTMLElement).getByRole('alert')).toHaveTextContent(
        'Session creation failed',
      )
      expect(screen.getAllByRole('alert')).toHaveLength(1)
    } finally {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: originalWidth,
      })
    }
  })

  it('removes a failed pending session before showing its error', async () => {
    let failCreation: ((error: Error) => void) | undefined
    vi.mocked(createSession).mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        failCreation = reject
      }),
    )
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await screen.findByRole('status', {
      name: 'Creating GitHub Copilot session on development in ~',
    })

    await act(async () => {
      failCreation?.(new Error('Session creation failed'))
      await Promise.resolve()
    })

    await waitFor(() =>
      expect(
        screen.queryByRole('status', {
          name: 'Creating GitHub Copilot session on development in ~',
        }),
      ).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Session creation failed')
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

  it('starts new sessions with the saved default backend', async () => {
    hubSettings.values = { newSessionBackend: 'sdk' }
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    const checkbox = screen.getByRole('checkbox', { name: /Create in tmux/ })
    expect(checkbox).not.toBeChecked()
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

  it('lets one session override the saved default backend', async () => {
    hubSettings.values = { newSessionBackend: 'sdk' }
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.click(screen.getByRole('checkbox', { name: /Create in tmux/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Create session' }))
    await waitFor(() =>
      expect(createSession).toHaveBeenCalledWith('computer-1', {
        cwd: '~',
        provider: 'copilot',
        terminalBacked: true,
        allowAllPermissions: true,
      }),
    )
    expect(hubSettings.values).toEqual({ newSessionBackend: 'sdk' })
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

  it('keeps what is being filled in when a computer reports in', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    // The dialog fills itself in when it opens, so wait for that to settle
    // before choosing anything: otherwise the choice races the default.
    await waitFor(() =>
      expect(screen.getByLabelText('Agent provider')).toHaveValue('copilot'),
    )
    fireEvent.change(screen.getByLabelText('Agent provider'), {
      target: { value: 'claude' },
    })

    // A node going online, a status refresh on returning to the tab: routine
    // traffic that rebuilds the computer list while the dialog is open.
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'computer.updated',
          computer: { ...computer, name: 'development' },
        }),
      } as MessageEvent)
    })

    expect(screen.getByLabelText('Agent provider')).toHaveValue('claude')
  })

  it('opens with the computer the reader is already on', async () => {
    const remote: ComputerSummary = {
      ...computer,
      id: 'computer-2',
      name: 'worker-node',
      isLocal: false,
    }
    const remoteSession: ManagedSession = {
      ...session,
      id: 'session-remote',
      computerId: remote.id,
      computerName: remote.name,
      title: 'Worker chat',
    }
    vi.mocked(listComputers).mockResolvedValue([computer, remote])
    vi.mocked(listSessions).mockResolvedValue([session, remoteSession])
    vi.mocked(getSession).mockResolvedValue(remoteSession)
    render(<App />)
    fireEvent.click((await screen.findAllByText('Worker chat'))[0])

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])

    // The default is the computer being worked on, not whichever happens to
    // be first in the list.
    await waitFor(() =>
      expect(screen.getByLabelText('Computer')).toHaveValue(remote.id),
    )
  })

  it('leaves the focus in the field a dialog opened for', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(sessionAction('Rename session'))

    // The frame takes the focus only when the dialog has not placed it
    // itself. Pulling it back here would take the reader out of the field
    // they were put in, and typing straight away would go nowhere.
    const name = screen.getByLabelText('Session name')
    expect(name).toHaveFocus()
    fireEvent.change(name, { target: { value: 'Typed straight away' } })
    expect(name).toHaveValue('Typed straight away')
    fireEvent.keyDown(name, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Rename session' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Session actions' })).toHaveFocus()
  })

  it('fills the new-session dialog in once the computers arrive', async () => {
    // Opening before the first snapshot lands leaves nothing to choose.
    vi.mocked(listComputers).mockResolvedValue([])
    render(<App />)
    await waitFor(() => expect(listComputers).toHaveBeenCalled())

    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'computer.updated', computer }),
      } as MessageEvent)
    })

    await waitFor(() =>
      expect(screen.getByLabelText('Computer')).toHaveValue(computer.id),
    )
    expect(
      screen.getByRole('button', { name: 'Create session' }),
    ).toBeEnabled()
  })

  it('lets go of a knowledge root when its computer is unpaired', async () => {
    const remote: ComputerSummary = {
      ...computer,
      id: 'computer-2',
      name: 'worker-node',
      isLocal: false,
    }
    vi.mocked(listComputers).mockResolvedValue([computer, remote])
    mockKnowledgeRoots([
      {
        id: 'root-remote',
        computerId: remote.id,
        computerName: remote.name,
        path: '/home/tester/docs',
        name: 'worker docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    expect(await screen.findAllByText('worker docs')).not.toHaveLength(0)

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'computer.removed',
          computerId: remote.id,
        }),
      } as MessageEvent)
    })

    // Keep the saved reference recognizable, but never offer the removed
    // computer's files as though the root were still available.
    await screen.findByText('Saved folder unavailable')
    expect(screen.getByText('worker docs')).toBeVisible()
    expect(screen.queryByRole('tree')).not.toBeInTheDocument()
  })

  it('keeps a healthy folder load when an unrelated computer is removed', async () => {
    const remote: ComputerSummary = {
      ...computer, id: 'computer-2', name: 'worker-node', isLocal: false,
    }
    vi.mocked(listComputers).mockResolvedValue([computer, remote])
    mockKnowledgeRoots([knowledgeRoot])
    let finishFolder!: (listing: WorkspaceListing) => void
    vi.mocked(listKnowledgeEntries).mockImplementation(async (_rootId, path = '.') => {
      if (path === '.') {
        return {
          path: '.',
          entries: [{ name: 'docs', path: 'docs', kind: 'directory' }],
        }
      }
      return new Promise((resolve) => { finishFolder = resolve })
    })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    fireEvent.click(await within(tree).findByRole('treeitem', { name: /docs/ }))
    await waitFor(() => expect(finishFolder).toBeDefined())

    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'computer.removed', computerId: remote.id }),
      } as MessageEvent)
    })
    await act(async () => {
      finishFolder({
        path: 'docs', parent: '.',
        entries: [{ name: 'guide.md', path: 'docs/guide.md', kind: 'markdown' }],
      })
    })

    expect(await within(tree).findByRole('treeitem', { name: /guide.md/ }))
      .toBeInTheDocument()
  })

  it('forgets loaded Knowledge when a reconnect discovers a missed computer removal', async () => {
    const remote: ComputerSummary = {
      ...computer, id: 'computer-2', name: 'worker-node', isLocal: false,
    }
    vi.mocked(listComputers).mockResolvedValue([computer, remote])
    mockKnowledgeRoots([{
      id: 'root-remote', computerId: remote.id, computerName: remote.name,
      path: '/home/tester/docs', name: 'worker docs',
      createdAt: '2026-08-01T00:00:00.000Z',
    }])
    vi.mocked(listKnowledgeEntries).mockImplementation(knowledgeListings({
      '.': {
        path: '.',
        entries: [{ name: 'guide.md', path: 'guide.md', kind: 'markdown' }],
      },
    }))
    vi.mocked(readKnowledgeFile).mockResolvedValue({
      name: 'guide.md', path: 'guide.md', kind: 'markdown',
      mimeType: 'text/markdown', size: 20, content: '# Remote guide',
    })
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    fireEvent.click(await within(tree).findByRole('treeitem', { name: /guide.md/ }))
    await screen.findByRole('heading', { name: 'Remote guide' })

    vi.mocked(listComputers).mockResolvedValue([computer])
    await act(async () => {
      MockWebSocket.instances[0]?.onopen?.()
    })
    await screen.findByText('Saved folder unavailable')
    expect(screen.getByText('worker docs')).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Remote guide' })).not.toBeInTheDocument()
  })

  it('does not let the initial computer snapshot revive removed Knowledge', async () => {
    let finishComputers!: (value: ComputerSummary[]) => void
    let finishRoots!: (value: Awaited<ReturnType<typeof listKnowledgeRoots>>) => void
    vi.mocked(listComputers).mockReturnValue(new Promise((resolve) => {
      finishComputers = resolve
    }))
    vi.mocked(listKnowledgeRoots).mockReturnValue(new Promise((resolve) => {
      finishRoots = resolve
    }))
    render(<App />)
    await waitFor(() => expect(MockWebSocket.instances[0]?.onmessage).toBeTruthy())
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'computer.removed', computerId: secondComputer.id }),
      } as MessageEvent)
    })
    await act(async () => { finishComputers([computer, secondComputer]) })
    await screen.findAllByText('Project chat')
    await act(async () => {
      finishRoots([{
        id: 'removed-root', computerId: secondComputer.id,
        computerName: secondComputer.name, path: '/home/tester/docs',
        name: 'Removed worker docs', createdAt: '2026-09-05T00:00:00.000Z',
      }])
    })
    expect(screen.queryByText('Removed worker docs')).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    expect(within(screen.getByLabelText('Computer')).queryByRole('option', {
      name: secondComputer.name,
    })).not.toBeInTheDocument()
  })

  it('preserves newer computer records over the initial snapshot', async () => {
    let finishComputers!: (value: ComputerSummary[]) => void
    vi.mocked(listComputers).mockReturnValue(new Promise((resolve) => {
      finishComputers = resolve
    }))
    render(<App />)
    await waitFor(() => expect(MockWebSocket.instances[0]?.onmessage).toBeTruthy())
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'computer.updated',
          computer: { ...secondComputer, name: 'Current worker name' },
        }),
      } as MessageEvent)
    })
    await act(async () => { finishComputers([computer, secondComputer]) })
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    expect(within(screen.getByLabelText('Computer')).getByRole('option', {
      name: 'Current worker name',
    })).toBeInTheDocument()
    expect(within(screen.getByLabelText('Computer')).queryByRole('option', {
      name: secondComputer.name,
    })).not.toBeInTheDocument()
  })

  it('does not revive old Knowledge after the same computer is paired again', async () => {
    let finishRoots!: (value: Awaited<ReturnType<typeof listKnowledgeRoots>>) => void
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    vi.mocked(listKnowledgeRoots).mockReturnValue(new Promise((resolve) => {
      finishRoots = resolve
    }))
    render(<App />)
    await screen.findAllByText('Project chat')
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'computer.removed', computerId: secondComputer.id }),
      } as MessageEvent)
    })
    await act(async () => { MockWebSocket.instances[0]?.onopen?.() })
    await waitFor(() => expect(listComputers).toHaveBeenCalledTimes(2))
    await act(async () => {
      finishRoots([{
        id: 'old-pairing-root', computerId: secondComputer.id,
        computerName: secondComputer.name, path: '/home/tester/docs',
        name: 'Old pairing docs', createdAt: '2026-09-05T00:00:00.000Z',
      }])
    })
    expect(screen.queryByText('Old pairing docs')).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    expect(within(screen.getByLabelText('Computer')).getByRole('option', {
      name: secondComputer.name,
    })).toBeInTheDocument()
  })

  it('ignores an older partial computer list after a newer removal snapshot', async () => {
    let finishOlderComputers!: (value: ComputerSummary[]) => void
    let finishRoots!: (value: Awaited<ReturnType<typeof listKnowledgeRoots>>) => void
    vi.mocked(listComputers)
      .mockResolvedValueOnce([computer, secondComputer])
      .mockReturnValueOnce(new Promise((resolve) => { finishOlderComputers = resolve }))
      .mockResolvedValue([computer])
    vi.mocked(listSessionListing)
      .mockResolvedValueOnce({ sessions: [session], answeredComputerIds: [computer.id, secondComputer.id] })
      .mockResolvedValueOnce({ sessions: [session], answeredComputerIds: [secondComputer.id] })
      .mockResolvedValue({ sessions: [session], answeredComputerIds: [computer.id] })
    vi.mocked(listKnowledgeRoots).mockReturnValue(new Promise((resolve) => {
      finishRoots = resolve
    }))
    render(<App />)
    await screen.findAllByText('Project chat')
    act(() => { MockWebSocket.instances[0]?.onopen?.() })
    await waitFor(() => expect(listComputers).toHaveBeenCalledTimes(2))
    await act(async () => { MockWebSocket.instances[0]?.onopen?.() })
    await waitFor(() => expect(listComputers).toHaveBeenCalledTimes(3))
    await act(async () => { finishOlderComputers([computer, secondComputer]) })
    await act(async () => {
      finishRoots([{
        id: 'old-snapshot-root', computerId: secondComputer.id,
        computerName: secondComputer.name, path: '/home/tester/docs',
        name: 'Old snapshot docs', createdAt: '2026-09-05T00:00:00.000Z',
      }])
    })
    expect(screen.queryByText('Old snapshot docs')).not.toBeInTheDocument()
  })

  it('rejects a root creation response from an earlier pairing lifetime', async () => {
    let finishRoot!: (value: Awaited<ReturnType<typeof addKnowledgeRoot>>) => void
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    mockKnowledgeRoots([])
    vi.mocked(addKnowledgeRoot).mockReturnValue(new Promise((resolve) => {
      finishRoot = resolve
    }))
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const dialog = await screen.findByRole('dialog', { name: 'Add knowledge root' })
    fireEvent.change(within(dialog).getByLabelText('Computer'), {
      target: { value: secondComputer.id },
    })
    const add = within(dialog).getByRole('button', { name: 'Add this folder' })
    await waitFor(() => expect(add).toBeEnabled())
    fireEvent.click(add)
    await waitFor(() => expect(addKnowledgeRoot).toHaveBeenCalledOnce())
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'computer.removed', computerId: secondComputer.id }),
      } as MessageEvent)
    })
    await act(async () => { MockWebSocket.instances[0]?.onopen?.() })
    await waitFor(() => expect(listComputers).toHaveBeenCalledTimes(2))
    await act(async () => {
      finishRoot({
        id: 'stale-created-root', computerId: secondComputer.id,
        computerName: secondComputer.name, path: '/home/tester/docs',
        name: 'Stale created docs', createdAt: '2026-09-05T00:00:00.000Z',
      })
    })
    expect(await screen.findByText(/pairing changed while adding this folder/)).toBeInTheDocument()
    expect(screen.queryByText('Stale created docs')).not.toBeInTheDocument()
    expect(dialog).toBeInTheDocument()
  })

  it('recovers an empty computer selection without reopening the session dialog', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    await waitFor(() => expect(screen.getByLabelText('Computer')).toHaveValue(computer.id))
    fireEvent.change(screen.getByLabelText('Agent provider'), { target: { value: 'claude' } })
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'computer.updated', computer: { ...computer, online: false } }),
      } as MessageEvent)
    })
    await waitFor(() => expect(screen.getByLabelText('Computer')).toHaveProperty('value', ''))
    expect(screen.getByRole('button', { name: 'Create session' })).toBeDisabled()
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'computer.updated', computer }),
      } as MessageEvent)
    })
    await waitFor(() => expect(screen.getByLabelText('Computer')).toHaveValue(computer.id))
    expect(screen.getByLabelText('Agent provider')).toHaveValue('claude')
    expect(screen.getByRole('button', { name: 'Create session' })).toBeEnabled()
  })

  it('requires a new historical selection when the chosen computer disappears', async () => {
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    vi.mocked(listHistory).mockResolvedValue([
      historicalSession,
      { ...historicalSession, computerId: secondComputer.id, computerName: secondComputer.name },
    ])
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.click(screen.getByRole('tab', { name: 'Open previous' }))
    await waitFor(() => expect(screen.getByLabelText('Previous session')).toBeEnabled())
    fireEvent.change(screen.getByLabelText('Previous session'), {
      target: { value: `${computer.id}:${historicalSession.id}` },
    })
    expect(screen.getByRole('button', { name: 'Open session' })).toBeEnabled()
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'computer.updated', computer: { ...computer, online: false } }),
      } as MessageEvent)
    })
    await waitFor(() => expect(screen.getByLabelText('Computer')).toHaveValue(secondComputer.id))
    expect(screen.getByLabelText('Previous session')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Open session' })).toBeDisabled()
    expect(activateSession).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('Previous session'), {
      target: { value: `${secondComputer.id}:${historicalSession.id}` },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Open session' }))
    await waitFor(() => expect(activateSession).toHaveBeenCalledWith(secondComputer.id, historicalSession.id))
  })

  it('accepts fresh Knowledge after another tab announces a re-pairing', async () => {
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    mockKnowledgeRoots([])
    mockAddedKnowledgeRoot({
      id: 'fresh-pairing-root', computerId: secondComputer.id,
      computerName: secondComputer.name, path: '/home/worker/docs',
      name: 'Fresh pairing docs', createdAt: '2026-09-05T00:00:00.000Z',
    })
    render(<App />)
    await screen.findAllByText('Project chat')
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'computer.removed', computerId: secondComputer.id }),
      } as MessageEvent)
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'computer.updated', computer: secondComputer }),
      } as MessageEvent)
    })
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const dialog = await screen.findByRole('dialog', { name: 'Add knowledge root' })
    fireEvent.change(within(dialog).getByLabelText('Computer'), {
      target: { value: secondComputer.id },
    })
    const add = within(dialog).getByRole('button', { name: 'Add this folder' })
    await waitFor(() => expect(add).toBeEnabled())
    fireEvent.click(add)
    expect(await screen.findAllByText('Fresh pairing docs')).not.toHaveLength(0)
    expect(listComputers).toHaveBeenCalledOnce()
  })

  it.each(['automatic', 'manual'])(
    'keeps the folder owned by its computer after %s selection changes',
    async (selection) => {
      const remote = { ...secondComputer, providers: computer.providers }
      let finish!: (value: Awaited<ReturnType<typeof listDirectories>>) => void
      const pending = new Promise<Awaited<ReturnType<typeof listDirectories>>>((resolve) => {
        finish = resolve
      })
      vi.mocked(listComputers).mockResolvedValue([computer, remote])
      vi.mocked(listDirectories).mockImplementation((id) => id === remote.id
        ? pending
        : Promise.resolve({ path: '/home/local/project', directories: [] }))
      render(<App />)
      await screen.findAllByText('Project chat')
      fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
      const dialog = await screen.findByRole('dialog', { name: 'Choose a folder' })
      const create = within(dialog).getByRole('button', { name: 'Create session' })
      await waitFor(() => expect(create).toBeEnabled())
      fireEvent.change(within(dialog).getByLabelText('Agent provider'), {
        target: { value: 'claude' },
      })
      if (selection === 'automatic') {
        act(() => {
          MockWebSocket.instances[0]?.onmessage?.({
            data: JSON.stringify({
              type: 'computer.updated', computer: { ...computer, online: false },
            }),
          } as MessageEvent)
        })
      } else {
        fireEvent.change(within(dialog).getByLabelText('Computer'), {
          target: { value: remote.id },
        })
      }
      await waitFor(() => expect(within(dialog).getByLabelText('Computer')).toHaveValue(remote.id))
      if (selection === 'manual') {
        expect(create).toBeEnabled()
        fireEvent.click(create)
        await waitFor(() => expect(createSession).toHaveBeenCalledWith(
          remote.id, expect.objectContaining({ cwd: '~', provider: 'copilot' }),
        ))
        await act(async () => { finish({ path: '/home/worker/project', directories: [] }) })
        return
      }
      expect(create).toBeDisabled()
      fireEvent.submit(create.closest('form')!)
      await within(dialog).findByText(/wait for its folder to load/)
      expect(createSession).not.toHaveBeenCalled()
      await act(async () => { finish({ path: '/home/worker/project', directories: [] }) })
      await waitFor(() => expect(create).toBeEnabled())
      fireEvent.click(create)
      await waitFor(() => expect(createSession).toHaveBeenCalledWith(
        remote.id,
        expect.objectContaining({
          cwd: '/home/worker/project',
          provider: selection === 'automatic' ? 'claude' : 'copilot',
        }),
      ))
    },
  )

  it('does not enable creation with an old folder when fallback loading fails', async () => {
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    vi.mocked(listDirectories).mockImplementation(async (id) => {
      if (id === secondComputer.id) throw new Error('New folder is unavailable')
      return { path: '/home/local/project', directories: [] }
    })
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    const dialog = await screen.findByRole('dialog', { name: 'Choose a folder' })
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Create session' })).toBeEnabled())
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'computer.updated', computer: { ...computer, online: false },
        }),
      } as MessageEvent)
    })
    await within(dialog).findByText('New folder is unavailable')
    expect(within(dialog).getByRole('button', { name: 'Create session' })).toBeDisabled()
    expect(createSession).not.toHaveBeenCalled()
  })

  it('includes native summary controls in modal Tab and Shift+Tab wrapping', async () => {
    const width = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100)
    try {
      vi.mocked(listComputers).mockResolvedValue([taskComputer])
      vi.mocked(listBackgroundTasks).mockResolvedValue({
        tasks: [{
          id: 'task-summary', type: 'agent', status: 'running',
          description: 'Inspect the prompt', prompt: 'Read the source without changing it',
          startedAt: '2026-09-05T00:00:00.000Z', canCancel: false,
        }],
        runningCount: 1, supported: true,
      })
      render(<App />)
      fireEvent.click(await screen.findByRole('button', {
        name: 'View background tasks for Project chat',
      }))
      const dialog = await screen.findByRole('dialog', { name: 'Background tasks · Project chat' })
      const summary = within(dialog).getByText('Prompt', { selector: 'summary' })
      const close = within(dialog).getByRole('button', { name: 'Close' })
      summary.focus()
      fireEvent.keyDown(document, { key: 'Tab' })
      expect(close).toHaveFocus()
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
      expect(summary).toHaveFocus()
      summary.setAttribute('tabindex', '-1')
      summary.focus()
      fireEvent.keyDown(document, { key: 'Tab' })
      expect(close).toHaveFocus()
    } finally {
      width.mockRestore()
    }
  })

  it('does not inherit the modal-summary visibility override', () => {
    expect(document.createElement('button').offsetWidth).toBe(0)
  })

  it('takes the focus it claims and gives it back on Escape', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    const opener = screen.getAllByRole('button', { name: 'New session' })[0]
    opener.focus()
    fireEvent.click(opener)

    // `aria-modal` tells a reader the page behind is out of reach, so the
    // focus has to be inside the dialog -- on the frame, or on whatever the
    // dialog focused for itself.
    const dialog = await screen.findByRole('dialog', { name: 'Choose a folder' })
    expect(dialog.contains(document.activeElement)).toBe(true)

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Choose a folder' }),
      ).not.toBeInTheDocument(),
    )
    expect(opener).toHaveFocus()
  })

  it('keeps working when the browser refuses to remember anything', async () => {
    // Safari with cookies blocked throws on the first access, and a full quota
    // throws on the write. Both happen inside effects, where an exception
    // takes the whole tree down and leaves a blank page.
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('The quota has been exceeded.')
      })
    try {
      render(<App />)
      await screen.findAllByText('Project chat')

      fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])

      expect(
        screen.getByRole('button', { name: 'Create session' }),
      ).toBeInTheDocument()
    } finally {
      setItem.mockRestore()
    }
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
      screen.getByText('Tap Send · Return adds a line'),
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

  it('does not leave a reopened sheet disabled after an older historical activation fails', async () => {
    let failActivation: ((error: Error) => void) | undefined
    vi.mocked(activateSession).mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        failActivation = reject
      }),
    )
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    fireEvent.click(screen.getByRole('tab', { name: 'Open previous' }))
    await screen.findByRole('heading', { name: 'Open previous session' })
    fireEvent.change(screen.getByLabelText('Previous session'), {
      target: { value: 'computer-1:historical-session' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Open session' }))

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Open previous session' }),
      ).not.toBeInTheDocument(),
    )
    fireEvent.click(screen.getAllByRole('button', { name: 'New session' })[0])
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Create session' })).toBeEnabled(),
    )

    await act(async () => {
      failActivation?.(new Error('Historical activation failed'))
      await Promise.resolve()
    })

    expect(
      screen.getByRole('dialog', { name: 'Choose a folder' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create session' })).toBeEnabled()
    expect(screen.queryByText('Historical activation failed')).not.toBeInTheDocument()
  })

  it('renames the selected session from the conversation header', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(sessionAction('Rename session'))
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

  it('applies a live queue removal without requesting a reorder', async () => {
    const first = { id: 'q1', content: 'one', createdAt: '2026-07-25T01:00:00.000Z' }
    const second = { id: 'q2', content: 'two', createdAt: '2026-07-25T01:00:01.000Z' }
    const queuedSession = {
      ...session,
      status: 'running' as const,
      queuedCount: 2,
      queuedPrompts: [first, second],
    }
    vi.mocked(listSessions).mockResolvedValue([queuedSession])
    vi.mocked(getSession).mockResolvedValue(queuedSession)

    render(<App />)
    await screen.findByText('one')

    // Receiving a queue update is not itself a user reorder request.
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: { ...queuedSession, queuedCount: 1, queuedPrompts: [second] },
        }),
      } as MessageEvent)
    })
    await waitFor(() => expect(screen.queryByText('one')).not.toBeInTheDocument())

    expect(reorderQueuedPrompts).not.toHaveBeenCalled()
    expect(screen.getByText('two')).toBeInTheDocument()
  })

  it('exposes a reorder handle for each queued prompt', async () => {
    const first = { id: 'q1', content: 'one', createdAt: '2026-07-25T01:00:00.000Z' }
    const second = { id: 'q2', content: 'two', createdAt: '2026-07-25T01:00:01.000Z' }
    const queuedSession = {
      ...session,
      status: 'running' as const,
      queuedCount: 2,
      queuedPrompts: [first, second],
    }
    vi.mocked(listSessions).mockResolvedValue([queuedSession])
    vi.mocked(getSession).mockResolvedValue(queuedSession)
    vi.mocked(reorderQueuedPrompts).mockResolvedValue({
      ...queuedSession,
      queuedPrompts: [second, first],
    })

    render(<App />)
    await screen.findByText('one')

    // Each waiting message carries a handle, which is what the order is
    // changed by.
    expect(
      screen.getByRole('button', { name: 'Reorder queued prompt 1' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reorder queued prompt 2' }),
    ).toBeInTheDocument()
  })

  it('keeps three overlapping queue drags in one serialized lane', async () => {
    const prompts = ['one', 'two', 'three'].map((content, index) => ({
      id: `q${index + 1}`, content, createdAt: '2026-09-05T00:00:00.000Z',
    }))
    const queuedSession: ManagedSession = {
      ...session, status: 'running', queuedCount: 3, queuedPrompts: prompts,
    }
    vi.mocked(listSessions).mockResolvedValue([queuedSession])
    vi.mocked(getSession).mockResolvedValue(queuedSession)
    const replies: Array<(value: ManagedSession) => void> = []
    vi.mocked(reorderQueuedPrompts).mockImplementation(() => new Promise((resolve) => {
      replies.push(resolve)
    }))
    render(<App />)
    await screen.findByText('one')
    act(() => finishQueueReorder('q1', 'q3'))
    await waitFor(() => expect(reorderQueuedPrompts).toHaveBeenCalledOnce())
    act(() => {
      finishQueueReorder('q3', 'q2')
      finishQueueReorder('q1', 'q3')
    })
    expect(reorderQueuedPrompts).toHaveBeenCalledOnce()
    await act(async () => {
      replies[0]({ ...queuedSession, queuedPrompts: [prompts[1], prompts[2], prompts[0]] })
    })
    expect(reorderQueuedPrompts).toHaveBeenCalledTimes(2)
    expect(reorderQueuedPrompts).toHaveBeenNthCalledWith(
      2, computer.id, session.id, ['q3', 'q2', 'q1'],
    )
    await act(async () => {
      replies[1]({ ...queuedSession, queuedPrompts: [prompts[2], prompts[1], prompts[0]] })
    })
    expect(reorderQueuedPrompts).toHaveBeenCalledTimes(3)
    expect(reorderQueuedPrompts).toHaveBeenNthCalledWith(
      3, computer.id, session.id, ['q1', 'q3', 'q2'],
    )
    await act(async () => {
      replies[2]({ ...queuedSession, queuedPrompts: [prompts[0], prompts[2], prompts[1]] })
    })
    expect(Array.from(document.querySelectorAll('.queued-prompt > span:nth-child(2)'))
      .map((element) => element.textContent)).toEqual(['one', 'three', 'two'])
  })

  it('starts the next queued reorder from the successful recovery response', async () => {
    const prompts = ['one', 'two', 'three'].map((content, index) => ({
      id: `q${index + 1}`, content, createdAt: '2026-09-05T00:00:00.000Z',
    }))
    const queuedSession: ManagedSession = {
      ...session, status: 'running', queuedCount: 3, queuedPrompts: prompts,
    }
    vi.mocked(listSessions).mockResolvedValue([queuedSession])
    vi.mocked(getSession).mockResolvedValue(queuedSession)
    render(<App />)
    await screen.findByText('one')
    await waitFor(() => expect(getSession).toHaveBeenCalled())
    vi.mocked(getSession).mockClear()
    let refuseFirst: (error: Error) => void = () => {
      throw new Error('The first reorder has not started')
    }
    let recover: (value: ManagedSession) => void = () => {
      throw new Error('The recovery request has not started')
    }
    vi.mocked(reorderQueuedPrompts)
      .mockImplementationOnce(() => new Promise((_resolve, reject) => {
        refuseFirst = reject
      }))
      .mockResolvedValueOnce(queuedSession)
    vi.mocked(getSession).mockImplementationOnce(() =>
      new Promise((resolve) => { recover = resolve }),
    )
    act(() => finishQueueReorder('q1', 'q3'))
    await waitFor(() => expect(reorderQueuedPrompts).toHaveBeenCalledOnce())
    act(() => finishQueueReorder('q3', 'q2'))
    expect(reorderQueuedPrompts).toHaveBeenCalledOnce()
    await act(async () => {
      refuseFirst(new Error('The queue changed'))
      await Promise.resolve()
      expect(getSession).toHaveBeenCalledOnce()
      recover({ ...queuedSession, queuedPrompts: [prompts[2], prompts[0], prompts[1]] })
      for (let index = 0; index < 8; index += 1) await Promise.resolve()
    })
    expect(reorderQueuedPrompts).toHaveBeenNthCalledWith(
      2, computer.id, session.id, ['q1', 'q2', 'q3'],
    )
  })

  async function openTargetedQueueEditor() {
    const prompts = ['first original', 'second original', 'third original'].map((content, index) => ({
      id: `q${index + 1}`, content, createdAt: '2026-09-05T00:00:00.000Z',
    }))
    const queuedSession: ManagedSession = {
      ...session, queuedPrompts: prompts, queuedCount: prompts.length,
    }
    vi.mocked(listComputers).mockResolvedValue([{
      ...computer,
      providers: computer.providers?.map((provider) => ({
        ...provider, supportsQueuedPromptDispatch: true,
      })),
    }])
    vi.mocked(listSessions).mockResolvedValue([queuedSession])
    vi.mocked(getSession).mockResolvedValue(queuedSession)
    const rendered = render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Edit queued prompt 2' }))
    const textarea = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' })
    expect(textarea).toHaveValue('second original')
    return { rendered, textarea, queuedSession, prompts, key: 'computer-1:session-1' }
  }

  it.each(['save', 'send'])('expands pasted queued rewrites without trimming them on %s', async (action) => {
    const { textarea, queuedSession, prompts } = await openTargetedQueueEditor()
    const pasted = Array.from({ length: 21 }, (_, index) => `  line ${index}`).join('\n')
    fireEvent.change(textarea, { target: { value: '  before ' } })
    textarea.setSelectionRange(textarea.value.length, textarea.value.length)
    fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
    fireEvent.change(textarea, { target: { value: `${textarea.value} after \n` } })
    expect(textarea).toHaveValue('  before [Paste #1 - 21 lines] after \n')
    vi.mocked(updateQueuedPrompt).mockResolvedValue({ session: queuedSession, prompt: prompts[1] })
    vi.mocked(dispatchQueuedPrompt).mockResolvedValue({
      outcome: 'sent', promptId: 'q2', attemptId: 'attempt-1',
      session: { ...queuedSession, queuedPrompts: [prompts[0], prompts[2]], queuedCount: 2 },
    })
    fireEvent.click(screen.getByRole('button', {
      name: action === 'save' ? 'Save to queue' : 'Send edited message',
    }))
    await waitFor(() => expect(action === 'save' ? updateQueuedPrompt : dispatchQueuedPrompt)
      .toHaveBeenCalledExactlyOnceWith(computer.id, session.id, 'q2', `  before ${pasted} after \n`))
    expect(sendMessage).not.toHaveBeenCalled()
    expect(executeCommand).not.toHaveBeenCalled()
  })

  it('keeps history previews separate from a queued rewrite on save and send', async () => {
    const { textarea } = await openTargetedQueueEditor()
    fireEvent.change(textarea, { target: { value: 'my queued rewrite' } })
    fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
    expect(textarea).toHaveValue('Hello agent')
    fireEvent.click(screen.getByRole('button', { name: 'Save to queue' }))
    await screen.findAllByText(/Return to your queued rewrite/)
    fireEvent.click(screen.getByRole('button', { name: 'Send edited message' }))
    expect(updateQueuedPrompt).not.toHaveBeenCalled()
    expect(dispatchQueuedPrompt).not.toHaveBeenCalled()
    expect(sendMessage).not.toHaveBeenCalled()
    fireEvent.keyDown(textarea, { key: 'ArrowDown' })
    expect(textarea).toHaveValue('my queued rewrite')
  })

  it('labels the queued primary action as Save when immediate dispatch is unavailable', async () => {
    await openTargetedQueueEditor()
    act(() => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({ type: 'computer.updated', computer }),
      } as MessageEvent)
    })
    expect(screen.getByRole('button', { name: 'Put this back in the queue' }))
      .toHaveTextContent('Save')
    expect(screen.queryByRole('button', { name: 'Send edited message' })).toBeNull()
  })

  it('does not let queued-edit focus steal a newly opened modal', async () => {
    const queued = {
      ...session,
      queuedPrompts: [{ id: 'q1', content: 'Queued original', createdAt: session.updatedAt }],
      queuedCount: 1,
    }
    vi.mocked(listSessions).mockResolvedValue([queued])
    vi.mocked(getSession).mockResolvedValue(queued)
    render(<App />)
    const edit = await screen.findByRole('button', { name: 'Edit queued prompt 1' })
    const frames: FrameRequestCallback[] = []
    const animation = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback)
      return frames.length
    })
    try {
      fireEvent.click(edit)
      fireEvent.click(sessionAction('Rename session'))
      const name = screen.getByLabelText('Session name')
      act(() => {
        while (frames.length) frames.shift()!(0)
      })
      expect(name).toHaveFocus()
    } finally {
      animation.mockRestore()
    }
  })

  it('does not run an app command hidden inside a pasted queued rewrite', async () => {
    const { textarea } = await openTargetedQueueEditor()
    fireEvent.change(textarea, { target: { value: '' } })
    const pasted = ['  /clear', ...Array.from({ length: 21 }, () => 'extra line')].join('\n')
    fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
    fireEvent.click(screen.getByRole('button', { name: 'Send edited message' }))
    await screen.findAllByText(/answered by this app/)
    expect(clearConversation).not.toHaveBeenCalled()
    expect(dispatchQueuedPrompt).not.toHaveBeenCalled()
    expect(executeCommand).not.toHaveBeenCalled()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('does not dispatch a queued rewrite without its durable ownership record', async () => {
    const { textarea, key } = await openTargetedQueueEditor()
    fireEvent.change(textarea, { target: { value: 'my queued rewrite' } })
    const setItem = Storage.prototype.setItem
    const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      function (this: Storage, storageKey, value) {
        if (this === localStorage && storageKey === 'agentic-remote:composer-drafts-v2' &&
          value.includes('"pendingSubmission"')) {
          throw new DOMException('No space for pending send', 'QuotaExceededError')
        }
        setItem.call(this, storageKey, value)
      },
    )
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Send edited message' }))
      await screen.findByText(/Message was not sent/)
      expect(dispatchQueuedPrompt).not.toHaveBeenCalled()
      expect(textarea).toHaveValue('my queued rewrite')
      const stored = JSON.parse(localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}')
      expect(stored[key].queuedEdit).toEqual({ promptId: 'q2' })
      expect(stored[key].pendingSubmission).toBeUndefined()
      expect(localStorage.getItem('agentic-remote:queued-dispatch-pending')).toBeNull()
    } finally {
      storage.mockRestore()
    }
  })

  it('keeps new writing separate from an accepted queued rewrite', async () => {
    const { textarea, queuedSession, prompts, key } = await openTargetedQueueEditor()
    fireEvent.change(textarea, { target: { value: 'dispatch only this rewrite' } })
    let accept: (result: Awaited<ReturnType<typeof dispatchQueuedPrompt>>) => void = () => {}
    vi.mocked(dispatchQueuedPrompt).mockImplementation(() => new Promise((resolve) => { accept = resolve }))
    fireEvent.click(screen.getByRole('button', { name: 'Send edited message' }))
    await waitFor(() => expect(dispatchQueuedPrompt).toHaveBeenCalledOnce())
    expect(textarea).toHaveValue('')
    const pending = JSON.parse(localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}')[key]
    expect(pending.queuedEdit).toEqual({ promptId: 'q2', dispatchPending: true })
    expect(pending.pendingSubmission).toMatchObject({
      text: 'dispatch only this rewrite', queuedPromptId: 'q2',
    })
    fireEvent.change(textarea, { target: { value: 'new draft while waiting' } })
    await act(async () => accept({
      outcome: 'sent', promptId: 'q2', attemptId: 'attempt-1',
      session: { ...queuedSession, queuedPrompts: [prompts[0], prompts[2]], queuedCount: 2 },
    }))
    expect(textarea).toHaveValue('new draft while waiting')
    expect(screen.queryByRole('button', { name: 'Save to queue' })).not.toBeInTheDocument()
    expect(localStorage.getItem('agentic-remote:queued-edit')).toBeNull()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('restores a definitively refused queued rewrite without losing its target', async () => {
    const { textarea, queuedSession, key } = await openTargetedQueueEditor()
    fireEvent.change(textarea, { target: { value: 'refused rewrite' } })
    vi.mocked(dispatchQueuedPrompt).mockResolvedValue({
      outcome: 'refused', promptId: 'q2', attemptId: 'attempt-1', restored: true,
      session: queuedSession, message: 'The original queued message is unchanged.',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send edited message' }))
    await waitFor(() => expect(textarea).toHaveValue('refused rewrite'))
    expect(screen.getByRole('button', { name: 'Send edited message' })).toBeEnabled()
    const stored = JSON.parse(localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}')[key]
    expect(stored.queuedEdit).toEqual({ promptId: 'q2' })
    expect(stored.deliveryUncertain).toBeUndefined()
    expect(localStorage.getItem('agentic-remote:queued-dispatch-pending')).toBeNull()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('keeps an unconfirmed queued rewrite locked across reload and an empty idle queue', async () => {
    const { rendered, textarea, queuedSession } = await openTargetedQueueEditor()
    fireEvent.change(textarea, { target: { value: 'unconfirmed rewrite' } })
    vi.mocked(dispatchQueuedPrompt).mockRejectedValue(Object.assign(new Error('Response lost'), {
      uncertainDelivery: true,
    }))
    fireEvent.click(screen.getByRole('button', { name: 'Send edited message' }))
    await waitFor(() => expect(textarea).toHaveValue('unconfirmed rewrite'))
    const fresh = { ...queuedSession, queuedPrompts: [], queuedCount: 0 }
    vi.mocked(listSessions).mockResolvedValue([fresh])
    vi.mocked(getSession).mockResolvedValue(fresh)
    rendered.unmount()
    render(<App />)
    expect(await screen.findByRole('textbox', { name: 'Message' })).toHaveValue('unconfirmed rewrite')
    expect(screen.getByRole('button', { name: 'Send edited message' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Save to queue' })).toBeDisabled()
    expect(dispatchQueuedPrompt).toHaveBeenCalledOnce()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('keeps an explicit remote unknown outcome locked without fabricating an attempt ID', async () => {
    const { rendered, textarea, key } = await openTargetedQueueEditor()
    fireEvent.change(textarea, { target: { value: 'Keep this remote rewrite' } })
    const unknown = {
      outcome: 'uncertain' as const, promptId: 'q2', delivery: 'unknown' as const,
      message: 'The owning computer did not confirm dispatch. No automatic retry was made.',
    }
    vi.mocked(dispatchQueuedPrompt).mockResolvedValue(unknown)
    fireEvent.click(screen.getByRole('button', { name: 'Send edited message' }))
    await waitFor(() => expect(textarea).toHaveValue('Keep this remote rewrite'))
    await within(screen.getByRole('main')).findByText(unknown.message)
    expect(unknown).not.toHaveProperty('attemptId')
    expect(JSON.parse(localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}')[key].queuedEdit)
      .toEqual({ promptId: 'q2', dispatchPending: true })
    expect(screen.getByRole('button', { name: 'Save to queue' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Send edited message' })).toBeDisabled()
    rendered.unmount()
    render(<App />)
    expect(await screen.findByLabelText('Message')).toHaveValue('Keep this remote rewrite')
    expect(screen.getByRole('button', { name: 'Send edited message' })).toBeDisabled()
    expect(dispatchQueuedPrompt).toHaveBeenCalledOnce()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it.each(['v2 cleanup', 'every write'])(
    'does not restore accepted queued work as an ordinary send after failing %s',
    async (failure) => {
      const { rendered, textarea, queuedSession, prompts } = await openTargetedQueueEditor()
      fireEvent.change(textarea, { target: { value: 'accepted rewrite' } })
      let accept: (result: Awaited<ReturnType<typeof dispatchQueuedPrompt>>) => void = () => {}
      vi.mocked(dispatchQueuedPrompt).mockImplementation(() => new Promise((resolve) => { accept = resolve }))
      fireEvent.click(screen.getByRole('button', { name: 'Send edited message' }))
      await waitFor(() => expect(dispatchQueuedPrompt).toHaveBeenCalledOnce())
      const setItem = Storage.prototype.setItem
      const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
        function (this: Storage, key, value) {
          if (this === localStorage &&
            (failure === 'every write' || key === 'agentic-remote:composer-drafts-v2')) {
            throw new DOMException('Cleanup unavailable', 'QuotaExceededError')
          }
          setItem.call(this, key, value)
        },
      )
      try {
        const fresh = { ...queuedSession, queuedPrompts: [prompts[0], prompts[2]], queuedCount: 2 }
        await act(async () => accept({
          outcome: 'sent', promptId: 'q2', attemptId: 'attempt-1', session: fresh,
        }))
        expect(textarea).toHaveValue('')
        await screen.findByText(/Draft changes could not be saved/)
        vi.mocked(listSessions).mockResolvedValue([fresh])
        vi.mocked(getSession).mockResolvedValue(fresh)
        rendered.unmount()
        storage.mockRestore()
        render(<App />)
        const recovered = await screen.findByRole('textbox', { name: 'Message' })
        expect(recovered).toHaveValue(failure === 'every write' ? 'accepted rewrite' : '')
        if (failure === 'every write') {
          expect(screen.getByRole('button', { name: 'Send edited message' })).toBeDisabled()
        }
        expect(dispatchQueuedPrompt).toHaveBeenCalledOnce()
        expect(sendMessage).not.toHaveBeenCalled()
      } finally {
        storage.mockRestore()
      }
    },
  )

  it('keeps the edit target while the only queued item is claimed from an idle session', async () => {
    const { textarea, queuedSession } = await openTargetedQueueEditor()
    fireEvent.change(textarea, { target: { value: 'keep my rewrite attached' } })
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: {
            ...queuedSession, queuedPrompts: [], queuedCount: 0,
            queuedDispatch: {
              promptId: 'q2', attemptId: 'attempt-1', state: 'dispatching',
              content: 'second original', startedAt: '2026-09-05T00:00:00Z',
            },
          },
        }),
      } as MessageEvent)
    })
    expect(textarea).toHaveValue('keep my rewrite attached')
    expect(screen.getByRole('button', { name: 'Save to queue' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Send edited message' })).toBeDisabled()
    expect(localStorage.getItem('agentic-remote:queued-edit')).toContain('q2')
  })

  it('keeps the text when the message being edited leaves the queue', async () => {
    // A message being rewritten is still an ordinary waiting message: the
    // agent can reach it and send it, or it can be removed. Either way it is
    // no longer there to be written back to, and the banner would go on
    // offering a Save that could not succeed. What was typed is kept.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)

    render(<App />)
    await screen.findByText('the original text')

    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('the original text'),
    )
    const composer = screen.getByLabelText('Message')
    fireEvent.change(composer, { target: { value: 'my rewritten text' } })
    expect(document.querySelector('.queued-edit-banner')).not.toBeNull()

    // The agent reaches it and sends it while it is being rewritten.
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          // Settled, with the message genuinely gone. A drain takes it off
          // before dispatching and puts it back if it cannot go, so an absence
          // while the session is still working says nothing.
          session: {
            ...withQueue,
            status: 'idle',
            queuedCount: 0,
            queuedPrompts: [],
          },
        }),
      } as MessageEvent)
    })

    // Out of edit mode, because there is nothing left to write back to...
    await waitFor(() =>
      expect(document.querySelector('.queued-edit-banner')).toBeNull(),
    )
    // ...and the rewriting is still there rather than lost to a race.
    expect(screen.getByLabelText('Message')).toHaveValue('my rewritten text')
  })

  it('writes a shortcut out in full when saving it to the queue', async () => {
    // A shortcut is something this app expands on its way to the runtime. The
    // queue's own drain expands nothing, so `/aa on` stored as typed reached
    // the runtime as a command it has never heard of -- and the message was
    // consumed without being carried out.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)
    vi.mocked(listCommands).mockResolvedValue([
      {
        name: 'allow-all',
        description: 'Allow every tool',
        allowDuringAgentExecution: false,
      },
    ])
    vi.mocked(updateQueuedPrompt).mockResolvedValue({
      session: withQueue,
      prompt: queued,
    })

    render(<App />)
    await screen.findByText('the original text')
    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('the original text'),
    )
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: '/aa on' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save to queue' }))

    await waitFor(() =>
      expect(updateQueuedPrompt).toHaveBeenCalledWith(
        withQueue.computerId,
        withQueue.id,
        'q1',
        '/allow-all on',
      ),
    )
  })

  it('refuses to save an edit into a command this session does not have', async () => {
    // Claude advertises no commands of its own. Saved as one, the drain throws
    // when it reaches it, puts it back at the head, and everything behind it
    // waits for ever.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)
    vi.mocked(listCommands).mockResolvedValue([])

    render(<App />)
    await screen.findByText('the original text')

    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('the original text'),
    )
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: '/plan the work' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save to queue' }))

    await screen.findAllByText(/has no \/plan/i)
    expect(updateQueuedPrompt).not.toHaveBeenCalled()
  })

  it('lets go of the edit when its message drains from a session not on screen', async () => {
    // One marker serves every session, so one left set over a message that has
    // gone blocks editing anywhere -- and looking only at the session on
    // screen meant it was never noticed.
    const queued = {
      id: 'q1',
      content: 'queued here',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue, secondSession])
    vi.mocked(getSession).mockResolvedValue(withQueue)

    render(<App />)
    await screen.findByText('queued here')

    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('queued here'),
    )

    // Away to the other session, and the agent reaches the message meanwhile.
    vi.mocked(getSession).mockResolvedValue(secondSession)
    fireEvent.keyDown(window, {
      key: 'ArrowDown',
      code: 'ArrowDown',
      altKey: true,
    })
    await waitFor(() =>
      expect(document.querySelector('.queued-edit-banner')).toBeNull(),
    )
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          // Settled, with the message genuinely gone. A drain takes it off
          // before dispatching and puts it back if it cannot go, so an absence
          // while the session is still working says nothing.
          session: {
            ...withQueue,
            status: 'idle',
            queuedCount: 0,
            queuedPrompts: [],
          },
        }),
      } as MessageEvent)
    })

    // Let go of while another session is on screen, rather than waiting to be
    // noticed the next time its own is opened. One marker serves them all, so
    // until it is released no other message can be edited.
    await waitFor(() =>
      expect(localStorage.getItem('agentic-remote:queued-edit')).toBeNull(),
    )
  })

  it('remembers across a reload that a draft is a rewrite of a waiting message', async () => {
    // The rewrite is kept with the other drafts, which outlive a reload. Held
    // only in memory, the marker did not: what came back looked like an
    // ordinary draft standing beside the queued message it was a rewrite of,
    // and sending it delivered both.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)

    const first = render(<App />)
    await screen.findByText('the original text')
    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('the original text'),
    )
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'my rewritten text' },
    })
    await waitFor(() =>
      expect(localStorage.getItem('agentic-remote:queued-edit')).not.toBeNull(),
    )
    first.unmount()

    render(<App />)
    await screen.findByText('the original text')
    // Still a rewrite of that message, so Enter saves it rather than sending a
    // second copy.
    await waitFor(() =>
      expect(document.querySelector('.queued-edit-banner')).not.toBeNull(),
    )
    expect(screen.getByLabelText('Message')).toHaveValue('my rewritten text')
  })

  it('refuses to save an edit rewritten into a command this app answers', async () => {
    // The queue is drained by the agent, which has no /cwd. Saved as a waiting
    // message it would either stop the queue or, worse, be handed over as
    // ordinary text later. Refused at the point of saving, with the way to
    // carry it out named.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)

    render(<App />)
    await screen.findByText('the original text')

    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('the original text'),
    )
    const composer = screen.getByLabelText('Message')
    fireEvent.change(composer, { target: { value: '/cwd /tmp' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save to queue' }))

    await screen.findAllByText(/answered by this app rather than the agent/i)
    expect(updateQueuedPrompt).not.toHaveBeenCalled()
    // Still being edited, so it can be rewritten into something sendable.
    expect(document.querySelector('.queued-edit-banner')).not.toBeNull()
  })

  it('refuses to send an edit rewritten into a command this app answers', async () => {
    // These are carried out here, not by the agent, and they differ in whether
    // they can even be confirmed: a cancelled /cwd or a failed /restart never
    // happened. Carrying one out and then reconciling the copy still on the
    // queue is guesswork either way, so it is refused while the message is
    // still safely queued.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'idle' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)

    render(<App />)
    await screen.findByText('the original text')

    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('the original text'),
    )
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: '/cwd' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Put this back in the queue' }),
    )

    await screen.findAllByText(/answered by this app rather than the agent/i)
    // Nothing carried out, nothing removed, and the rewrite still in hand.
    expect(removeQueuedPrompt).not.toHaveBeenCalled()
    expect(updateQueuedPrompt).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Message')).toHaveValue('/cwd')
  })

  it('queues an edit rather than sending it when Queue is used', async () => {
    // Queue is the button that says "keep its place", and it means that while
    // rewriting too.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)
    vi.mocked(updateQueuedPrompt).mockResolvedValue({
      session: withQueue,
      prompt: queued,
    })

    render(<App />)
    await screen.findByText('the original text')
    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('the original text'),
    )
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'keep my place' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Queue message' }))

    await waitFor(() => expect(updateQueuedPrompt).toHaveBeenCalled())
    // Written back where it stands, not taken off and sent past the rest.
    expect(removeQueuedPrompt).not.toHaveBeenCalled()
  })

  it('saves the rewriting when Send is used while editing', async () => {
    // Sending a queued message now means claiming that exact prompt and
    // dispatching it where the queue is held, which the browser cannot do.
    // Writing it back is the one outcome that cannot lose it.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'idle' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)
    vi.mocked(updateQueuedPrompt).mockResolvedValue({
      session: withQueue,
      prompt: { ...queued, content: 'my rewritten text' },
    })

    render(<App />)
    await screen.findByText('the original text')
    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('the original text'),
    )
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'my rewritten text' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Put this back in the queue' }),
    )

    await waitFor(() =>
      expect(updateQueuedPrompt).toHaveBeenCalledWith(
        withQueue.computerId,
        withQueue.id,
        'q1',
        'my rewritten text',
      ),
    )
    // Never taken off the queue, so there is nothing to lose.
    expect(removeQueuedPrompt).not.toHaveBeenCalled()
  })

  it('says only that Send puts the message back in the queue', async () => {
    // The banner and the button have to describe what actually happens. They
    // promised an immediate send while the action wrote the rewriting back.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'idle' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)

    render(<App />)
    await screen.findByText('the original text')
    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(document.querySelector('.queued-edit-banner')).not.toBeNull(),
    )

    const banner = document.querySelector('.queued-edit-banner')!
    expect(banner.textContent).toContain('puts it back in the queue')
    expect(banner.textContent).not.toMatch(/sends it now/i)
    // Named for what it does, to a screen reader as much as on hover.
    expect(
      screen.getByRole('button', { name: 'Put this back in the queue' }),
    ).toHaveAttribute('title', 'Put this back in the queue')
  })

  it('lets another message be edited when the first one cannot be reached', async () => {
    // One marker serves every session. Its owner can be on a computer that is
    // not answering, and then there is no banner to see and no Escape to
    // press -- so refusing here left every queue in the app uneditable.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)

    const first = render(<App />)
    await screen.findByText('the original text')
    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(localStorage.getItem('agentic-remote:queued-edit')).not.toBeNull(),
    )
    first.unmount()

    // Back, with that computer offline and a queued message on another one.
    const otherQueued = {
      id: 'q2',
      content: 'a message over here',
      createdAt: '2026-07-25T02:00:00.000Z',
    }
    const otherWithQueue = {
      ...secondSession,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [otherQueued],
    }
    vi.mocked(listComputers).mockResolvedValue([
      { ...computer, online: false },
      secondComputer,
    ])
    vi.mocked(listSessions).mockResolvedValue([otherWithQueue])
    vi.mocked(getSession).mockResolvedValue(otherWithQueue)

    render(<App />)
    await screen.findByText('a message over here')
    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))

    // Taken over, rather than refused with nothing on screen to cancel.
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('a message over here'),
    )
  })

  it('does not offer to rewrite a queued message while the session is put down', async () => {
    // The composer is closed while a session is suspended, so opening a
    // message for rewriting there gave a banner over a box nothing could be
    // typed into.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const suspended = {
      ...session,
      status: 'idle' as const,
      suspended: true,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([suspended])
    vi.mocked(getSession).mockResolvedValue(suspended)

    render(<App />)
    await screen.findByText('the original text')

    expect(
      screen.getByRole('button', { name: 'Edit queued prompt 1' }),
    ).toBeDisabled()
  })

  it('lets the edit go when its message is deliberately removed', async () => {
    // Every other absence is a drain's doing and is waited out. This one is
    // the reader taking the message off themselves, and it is acknowledged --
    // so the marker goes with it, rather than leaving the banner offering to
    // save into a message that is not there.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)
    vi.mocked(removeQueuedPrompt).mockResolvedValue({
      session: { ...withQueue, queuedCount: 0, queuedPrompts: [] },
      prompt: queued,
    })

    render(<App />)
    await screen.findByText('the original text')
    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(localStorage.getItem('agentic-remote:queued-edit')).not.toBeNull(),
    )

    // Taken off deliberately, while the session is still working.
    fireEvent.click(
      screen.getByRole('button', { name: 'Remove queued prompt 1' }),
    )

    await waitFor(() =>
      expect(document.querySelector('.queued-edit-banner')).toBeNull(),
    )
  })

  it('keeps the edit while a drain has the message in hand', async () => {
    // A drain takes the prompt off before it dispatches and puts it back if it
    // cannot go, so the queue arrives here without it for a moment. Letting
    // the marker go then left the rewrite as an ordinary draft standing beside
    // the message that came back.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)

    render(<App />)
    await screen.findByText('the original text')
    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(localStorage.getItem('agentic-remote:queued-edit')).not.toBeNull(),
    )

    // Taken off to be dispatched, while the session is still working.
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: { ...withQueue, queuedCount: 0, queuedPrompts: [] },
        }),
      } as MessageEvent)
    })
    expect(localStorage.getItem('agentic-remote:queued-edit')).not.toBeNull()

    // It could not go, and comes back.
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: { ...withQueue, status: 'idle' },
        }),
      } as MessageEvent)
    })
    expect(document.querySelector('.queued-edit-banner')).not.toBeNull()
  })

  it('keeps one session edit from standing in the way of another', async () => {
    // Each session keeps its own. A single marker had to be taken from one
    // session to be used in another -- which left the first one's rewrite as
    // an ordinary draft beside the message it came from, ready to go twice --
    // and a session on a computer that had stopped answering held it against
    // every other.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    const otherQueued = {
      id: 'q2',
      content: 'a message over here',
      createdAt: '2026-07-25T02:00:00.000Z',
    }
    const otherWithQueue = {
      ...secondSession,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [otherQueued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue, otherWithQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)

    render(<App />)
    await screen.findByText('the original text')
    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('the original text'),
    )

    // Over to the other session, which has a waiting message of its own.
    vi.mocked(getSession).mockResolvedValue(otherWithQueue)
    fireEvent.keyDown(window, {
      key: 'ArrowDown',
      code: 'ArrowDown',
      altKey: true,
    })
    await screen.findByText('a message over here')
    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))

    // Editable here, and the first session's edit is untouched.
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('a message over here'),
    )
    const stored = JSON.parse(
      localStorage.getItem('agentic-remote:queued-edit') || '{}',
    )
    expect(Object.keys(stored)).toHaveLength(2)
  })

  it('will not leave the editor while the rewriting is being written back', async () => {
    // Leaving is meant to leave the message as it was. Closing the editor here
    // only hides it: the request already on its way still lands, and the
    // message changes with nothing on screen saying so.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)
    vi.mocked(updateQueuedPrompt).mockImplementation(
      () => new Promise(() => {}),
    )

    render(<App />)
    await screen.findByText('the original text')
    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('the original text'),
    )
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'my rewritten text' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save to queue' }))
    await waitFor(() => expect(updateQueuedPrompt).toHaveBeenCalled())

    expect(
      screen.getByLabelText('Stop editing this queued message'),
    ).toBeDisabled()
    fireEvent.keyDown(screen.getByLabelText('Message'), {
      key: 'Escape',
      code: 'Escape',
    })
    // Still editing the same message.
    expect(document.querySelector('.queued-edit-banner')).not.toBeNull()
    expect(screen.getByLabelText('Message')).toHaveValue('my rewritten text')
  })

  it('keeps the edit when the computer holding its message is not answering', async () => {
    // After a reload the listing holds only the computers that answered. A
    // node still connecting has no sessions in it at all, and reading that as
    // deletion threw away the rewrite for a message still queued on it.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)

    const first = render(<App />)
    await screen.findByText('the original text')
    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('the original text'),
    )
    await waitFor(() =>
      expect(localStorage.getItem('agentic-remote:queued-edit')).not.toBeNull(),
    )
    first.unmount()

    // Back, with that computer offline and none of its sessions listed.
    vi.mocked(listComputers).mockResolvedValue([
      { ...computer, online: false },
      secondComputer,
    ])
    vi.mocked(listSessions).mockResolvedValue([secondSession])
    vi.mocked(getSession).mockResolvedValue(secondSession)

    render(<App />)
    await screen.findAllByText('Second chat')
    await new Promise((resolve) => setTimeout(resolve, 60))
    expect(localStorage.getItem('agentic-remote:queued-edit')).not.toBeNull()
  })

  it('finishes the edit even if the reader moved to another session mid-save', async () => {
    // Whether the writing moved on is a question about the session that was
    // saved, not about whichever composer happens to be mounted. Asking the
    // mounted one meant switching sessions during the request left the marker
    // set -- over another session, with the saved draft already cleared, so
    // the composer looked empty and no other message could be edited.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue, secondSession])
    vi.mocked(getSession).mockResolvedValue(withQueue)
    let settleSave: (value: { session: ManagedSession }) => void = () => {}
    vi.mocked(updateQueuedPrompt).mockImplementation(
      () =>
        new Promise((resolve) => {
          settleSave = resolve as typeof settleSave
        }),
    )

    render(<App />)
    await screen.findByText('the original text')
    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('the original text'),
    )
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'my rewritten text' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save to queue' }))
    await waitFor(() => expect(updateQueuedPrompt).toHaveBeenCalled())

    // Away to another session while the save is still in flight.
    vi.mocked(getSession).mockResolvedValue(secondSession)
    fireEvent.keyDown(window, {
      key: 'ArrowDown',
      code: 'ArrowDown',
      altKey: true,
    })
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue(''),
    )
    await act(async () => {
      settleSave({
        session: {
          ...withQueue,
          queuedPrompts: [{ ...queued, content: 'my rewritten text' }],
        },
      })
    })

    // The edit is finished with, so the next message can be edited.
    await waitFor(() =>
      expect(localStorage.getItem('agentic-remote:queued-edit')).toBeNull(),
    )
  })

  it('stays in edit mode when the writing moved on while the save was in flight', async () => {
    // Two rewrites in a row: the first is still being written back when the
    // second is typed. Leaving edit mode on the first would leave that second
    // rewrite sitting in the composer as an ordinary draft, with no way back
    // to the message it was meant for, beside a queue still holding the older
    // text.
    const queued = {
      id: 'q1',
      content: 'the original text',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue])
    vi.mocked(getSession).mockResolvedValue(withQueue)
    let settleSave: (value: { session: ManagedSession }) => void = () => {}
    vi.mocked(updateQueuedPrompt).mockImplementation(
      () =>
        new Promise((resolve) => {
          settleSave = resolve as typeof settleSave
        }),
    )

    render(<App />)
    await screen.findByText('the original text')

    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('the original text'),
    )
    const composer = screen.getByLabelText('Message')
    fireEvent.change(composer, { target: { value: 'first rewrite' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save to queue' }))
    await waitFor(() => expect(updateQueuedPrompt).toHaveBeenCalled())

    // The next rewrite is typed before the first one has been written back.
    fireEvent.change(composer, { target: { value: 'second rewrite' } })
    await act(async () => {
      settleSave({
        session: {
          ...withQueue,
          queuedPrompts: [{ ...queued, content: 'first rewrite' }],
        },
      })
    })

    // Still editing the same message, so the second rewrite can be saved too.
    await waitFor(() =>
      expect(document.querySelector('.queued-edit-banner')).not.toBeNull(),
    )
    expect(screen.getByLabelText('Message')).toHaveValue('second rewrite')
  })

  it.each([
    ['rename', false, false], ['rename', true, false],
    ['detail', false, false], ['detail', true, false],
    ['queue removal', false, false], ['queue removal', true, false],
    ['rename', false, true], ['detail', false, true],
  ] as const)(
    'keeps accepted recovery redacted after serialized %s bytes arrive late (durable revision advanced=%s, newer token=%s)',
    async (surface, persisted, newerToken) => {
      const actualApi = await vi.importActual<typeof import('./api')>('./api')
      const recovery = { content: 'Previously accepted recovery', failedAt: 'resend:held-response', uncertain: true }
      const queued = { id: 'held-queue', content: 'Independent queue item', createdAt: session.updatedAt }
      const initial: ManagedSession = {
        ...session, revision: 6, messages: [], failedPrompt: recovery,
        queuedPrompts: surface === 'queue removal' ? [queued] : [], queuedCount: surface === 'queue removal' ? 1 : 0,
      }
      const returned: ManagedSession = {
        ...initial,
        revision: newerToken ? 7 : 6,
        failedPrompt: newerToken
          ? { content: 'A genuinely newer recovery', failedAt: 'resend:newer-response', uncertain: true }
          : recovery,
        title: surface === 'rename' ? 'Serialized rename' : initial.title,
        queuedPrompts: [], queuedCount: 0,
        messages: surface === 'detail'
          ? [{ id: 'serialized-detail', role: 'assistant', content: 'Legitimate serialized detail history', createdAt: session.updatedAt }]
          : [],
      }
      const bytes = JSON.stringify(surface === 'queue removal' ? { session: returned, prompt: queued } : { session: returned })
      let release: (() => void) | undefined
      let settled = false
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
        new Promise<Response>((resolve) => {
          release = () => resolve(new Response(bytes, {
            status: 200, headers: { 'content-type': 'application/json' },
          }))
        }),
      )
      vi.mocked(listSessions).mockResolvedValue([initial])
      vi.mocked(getSession).mockResolvedValue(initial)
      if (surface === 'rename') {
        vi.mocked(renameSession).mockImplementation(async (...args) => {
          const result = await actualApi.renameSession(...args)
          settled = true
          return result
        })
      } else if (surface === 'detail') {
        vi.mocked(getSession).mockImplementation(async (...args) => {
          const result = await actualApi.getSession(...args)
          settled = true
          return result
        })
      } else {
        vi.mocked(removeQueuedPrompt).mockImplementation(async (...args) => {
          const result = await actualApi.removeQueuedPrompt(...args)
          settled = true
          return result
        })
      }
      try {
        render(<App />)
        const editor = await screen.findByLabelText('Message')
        await waitFor(() => expect(editor).toHaveValue(recovery.content))
        if (surface === 'rename') {
          fireEvent.click(sessionAction('Rename session'))
          fireEvent.change(screen.getByLabelText('Session name'), { target: { value: returned.title } })
          fireEvent.submit(screen.getByLabelText('Session name').closest('form')!)
        } else if (surface === 'queue removal') {
          fireEvent.click(screen.getByRole('button', { name: 'Remove queued prompt 1' }))
        }
        await waitFor(() => expect(release).toBeDefined())
        expect(settled).toBe(false)
        await act(async () => {
          MockWebSocket.instances[0]?.onmessage?.({
            data: JSON.stringify({
              type: 'session.upserted',
              session: { ...returned, messages: [], failedPrompt: undefined, revision: persisted ? 9 : 6 },
            }),
          } as MessageEvent)
        })
        await waitFor(() => expect(editor).toHaveValue(''))
        await act(async () => { release!() })
        await waitFor(() => expect(settled).toBe(true))
        await act(async () => { await Promise.resolve() })
        if (surface === 'detail' && !persisted) {
          expect(await screen.findByText('Legitimate serialized detail history')).toBeInTheDocument()
        }
        expect(editor).toHaveValue(newerToken ? 'A genuinely newer recovery' : '')
      } finally {
        release?.()
        fetchSpy.mockRestore()
      }
    },
  )

  it('allows a fresh equal-revision detail request after an acceptance event', async () => {
    const actualApi = await vi.importActual<typeof import('./api')>('./api')
    const failed: ManagedSession = {
      ...session, revision: 6,
      failedPrompt: { content: 'Uncertain recovery after restart', failedAt: 'resend:restart', uncertain: true },
    }
    vi.mocked(listSessions).mockResolvedValue([failed, secondSession])
    vi.mocked(getSession).mockResolvedValue(failed)
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response(JSON.stringify({ session: failed }), { status: 200 }),
    )
    try {
      render(<App />)
      const editor = await screen.findByLabelText('Message')
      await waitFor(() => expect(editor).toHaveValue(failed.failedPrompt!.content))
      await act(async () => {
        MockWebSocket.instances[0]?.onmessage?.({
          data: JSON.stringify({ type: 'session.upserted', session: { ...failed, failedPrompt: undefined } }),
        } as MessageEvent)
      })
      await waitFor(() => expect(editor).toHaveValue(''))
      vi.mocked(getSession).mockImplementation((computerId, id) =>
        id === secondSession.id ? Promise.resolve(secondSession) : actualApi.getSession(computerId, id),
      )
      fireEvent.click(screen.getAllByText(secondSession.title)[0])
      await waitFor(() => expect(document.querySelector('.conversation-header__title')).toHaveTextContent(secondSession.title))
      fireEvent.click(screen.getAllByText(session.title)[0])
      await waitFor(() => expect(fetchSpy).toHaveBeenCalledOnce())
      await waitFor(() => expect(editor).toHaveValue(failed.failedPrompt!.content))
    } finally {
      fetchSpy.mockRestore()
    }
  })

  it.each(['newer recovery event', 'clear replacement'] as const)(
    'preserves %s when older serialized rename bytes arrive',
    async (change) => {
      const actualApi = await vi.importActual<typeof import('./api')>('./api')
      const failed: ManagedSession = {
        ...session, revision: 6,
        failedPrompt: { content: 'Old recovery', failedAt: 'resend:old-event', uncertain: true },
      }
      const newer: ManagedSession = {
        ...failed,
        ...(change === 'clear replacement'
          ? { id: 'replacement-event', title: 'Replacement session', replacedSessionIds: [session.id] }
          : {}),
        failedPrompt: { content: 'New event-owned recovery', failedAt: 'resend:new-event', uncertain: true },
      }
      const bytes = JSON.stringify({ session: { ...failed, title: 'Held serialized rename' } })
      let release: (() => void) | undefined
      let settled = false
      vi.mocked(listSessions).mockResolvedValue([failed])
      vi.mocked(getSession).mockImplementation(async (_computerId, id) =>
        change === 'clear replacement' && id === newer.id ? newer : failed,
      )
      vi.mocked(renameSession).mockImplementation(async (...args) => {
        const response = await actualApi.renameSession(...args)
        settled = true
        return response
      })
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
        new Promise<Response>((resolve) => { release = () => resolve(new Response(bytes, { status: 200 })) }),
      )
      try {
        render(<App />)
        await screen.findByLabelText('Message')
        fireEvent.click(sessionAction('Rename session'))
        fireEvent.change(screen.getByLabelText('Session name'), { target: { value: 'Held serialized rename' } })
        fireEvent.submit(screen.getByLabelText('Session name').closest('form')!)
        await waitFor(() => expect(release).toBeDefined())
        await act(async () => {
          MockWebSocket.instances[0]?.onmessage?.({
            data: JSON.stringify({ type: 'session.upserted', session: { ...failed, failedPrompt: undefined } }),
          } as MessageEvent)
        })
        await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(''))
        await act(async () => {
          const socket = MockWebSocket.instances[0]
          if (change === 'clear replacement') {
            socket?.onmessage?.({
              data: JSON.stringify({
                type: 'session.removed', computerId: session.computerId,
                sessionId: session.id, replacedBy: newer.id,
              }),
            } as MessageEvent)
          }
          socket?.onmessage?.({ data: JSON.stringify({ type: 'session.upserted', session: newer }) } as MessageEvent)
        })
        await act(async () => { release!() })
        await waitFor(() => expect(settled).toBe(true))
        await act(async () => { await Promise.resolve() })
        await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(newer.failedPrompt!.content))
        if (change === 'clear replacement') {
          expect(document.querySelector('.conversation-header__title')).toHaveTextContent(newer.title)
          expect(screen.queryByText('Held serialized rename')).not.toBeInTheDocument()
        }
      } finally {
        release?.()
        fetchSpy.mockRestore()
      }
    },
  )

  it('leaves edit mode behind when the reader moves to another session', async () => {
    // The composer follows the selection, so a marker that does not is a
    // marker pointing at a message the reader can no longer see -- and Enter,
    // Send and Escape would all act on it.
    const queued = {
      id: 'q1',
      content: 'queued here',
      createdAt: '2026-07-25T01:00:00.000Z',
    }
    const withQueue = {
      ...session,
      status: 'running' as const,
      queuedCount: 1,
      queuedPrompts: [queued],
    }
    vi.mocked(listSessions).mockResolvedValue([withQueue, secondSession])
    vi.mocked(getSession).mockResolvedValue(withQueue)
    render(<App />)
    await screen.findByText('queued here')

    fireEvent.click(screen.getByRole('button', { name: 'Edit queued prompt 1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue('queued here'),
    )
    expect(document.querySelector('.queued-edit-banner')).not.toBeNull()

    vi.mocked(getSession).mockResolvedValue(secondSession)
    fireEvent.keyDown(window, {
      key: 'ArrowDown',
      code: 'ArrowDown',
      altKey: true,
    })

    // The other session is not the one being edited, so it is not in edit mode.
    await waitFor(() =>
      expect(document.querySelector('.queued-edit-banner')).toBeNull(),
    )
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

    // Editing opens the message for rewriting and leaves it where it is. It
    // used to take it off the queue, so changing your mind, or simply closing
    // the app, silently threw the message away.
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit queued prompt 1' }),
    )
    await waitFor(() =>
      expect(screen.getByLabelText('Message')).toHaveValue(
        'First queued prompt',
      ),
    )
    expect(removeQueuedPrompt).not.toHaveBeenCalled()
    expect(
      within(screen.getByLabelText('Queued prompts')).getByText(
        'First queued prompt',
      ),
    ).toBeInTheDocument()

    // Enter writes the change back to the queue rather than sending it.
    vi.mocked(updateQueuedPrompt).mockResolvedValue({
      session: {
        ...queuedSession,
        queuedPrompts: [{ ...first, content: 'First queued prompt, edited' }, second],
      },
      prompt: { ...first, content: 'First queued prompt, edited' },
    })
    const composer = screen.getByLabelText('Message')
    fireEvent.change(composer, {
      target: { value: 'First queued prompt, edited' },
    })
    fireEvent.keyDown(composer, { key: 'Enter' })

    await waitFor(() =>
      expect(updateQueuedPrompt).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        'queue-1',
        'First queued prompt, edited',
      ),
    )
    expect(sendMessage).not.toHaveBeenCalled()

    fireEvent.click(
      screen.getByRole('button', { name: 'Remove queued prompt 1' }),
    )
    await waitFor(() =>
      expect(removeQueuedPrompt).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        'queue-1',
      ),
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

  it('keeps a half-filled form through the upserts that carry it', async () => {
    const askingSession: ManagedSession = {
      ...session,
      status: 'waiting',
      pendingUserInput: {
        requestId: 'form-2',
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
          ],
        },
      },
    }
    vi.mocked(listSessions).mockResolvedValue([askingSession])
    vi.mocked(getSession).mockResolvedValue(askingSession)
    render(<App />)

    expect(await screen.findByText('What should I inspect?')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Inspection target'), {
      target: { value: 'half typed' },
    })

    // The same question, re-sent whole. A reconnect or a return to the tab
    // does exactly this, and it must not empty what is being typed into it.
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: structuredClone(askingSession),
        }),
      } as MessageEvent)
    })

    expect(screen.getByLabelText('Inspection target')).toHaveValue('half typed')
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
    vi.mocked(getManager).mockResolvedValue({
      available: true, status: 'idle', messages: [], queued: 0, managedSessions: [],
    })
    render(<App />)
    await screen.findAllByText('Project chat')
    await within(document.querySelector<HTMLElement>('.timeline-dock')!).findByRole('button', { name: 'Oracle' })

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
    // Stacked above Oracle's bubble in the same dock, never under it.
    const dock = document.querySelector<HTMLElement>('.timeline-dock')!
    expect(jump.parentElement).toBe(dock)
    expect(dock.lastElementChild).toHaveClass('oracle-bubble')
    expect(jump.compareDocumentPosition(dock.lastElementChild!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    // With Oracle's panel open over the right of the conversation, the dock
    // moves to just left of it, so Scroll to latest stays in reach.
    expect(dock).not.toHaveAttribute('data-oracle-open')
    fireEvent.click(within(dock).getByRole('button', { name: 'Oracle' }))
    const panel = await screen.findByRole('dialog', { name: 'Oracle' })
    expect(dock).toHaveAttribute('data-oracle-open')
    expect(dock.style.getPropertyValue('--oracle-panel-width')).toMatch(/^\d+px$/)
    expect(dock.style.getPropertyValue('--oracle-panel-width')).toBe(panel.style.getPropertyValue('--oracle-width'))
    expect(within(dock).getByRole('button', { name: 'Scroll to latest' })).toBe(jump)
    fireEvent.click(screen.getByRole('button', { name: 'Close Oracle' }))
    expect(dock).not.toHaveAttribute('data-oracle-open')
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

  describe('side questions', () => {
    const sideComputer: ComputerSummary = {
      ...computer,
      providers: computer.providers?.map((provider) =>
        provider.id === 'copilot' ? { ...provider, supportsSideQuestions: true } : provider),
    }
    const thread = () => screen.queryByRole('region', { name: 'Side questions' })
    const askFromBar = (question: string) => {
      const bar = screen.getByLabelText('Side question')
      fireEvent.change(bar, { target: { value: question } })
      fireEvent.keyDown(bar, { key: 'Enter' })
    }

    it('hides side questions where the computer has not advertised them', async () => {
      render(<App />)
      await screen.findByText('Hello agent')
      expect(screen.queryByRole('button', { name: 'Ask a side question' })).not.toBeInTheDocument()
    })

    it('asks from the message bar without prompting the session or losing its draft', async () => {
      vi.mocked(listComputers).mockResolvedValue([sideComputer])
      let answer: ((value: string) => void) | undefined
      vi.mocked(askSession).mockReturnValueOnce(new Promise((resolve) => { answer = resolve }))
      render(<App />)
      await screen.findByText('Hello agent')
      fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Keep this draft' } })

      const toggle = await screen.findByRole('button', { name: 'Ask a side question' })
      fireEvent.click(toggle)
      expect(toggle).toHaveAttribute('aria-pressed', 'true')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(thread()).toBeInTheDocument()
      const bar = screen.getByLabelText('Side question')
      expect(bar).toHaveValue('')
      expect(screen.queryByLabelText('Message')).not.toBeInTheDocument()
      await waitFor(() => expect(bar).toHaveFocus())
      askFromBar('  What did we decide?  ')

      await waitFor(() =>
        expect(askSession).toHaveBeenCalledWith('computer-1', 'session-1', 'What did we decide?', []),
      )
      expect(bar).toHaveValue('')
      expect(within(thread()!).getByRole('status')).toHaveTextContent('Thinking…')
      fireEvent.change(bar, { target: { value: 'Typed while waiting' } })
      expect(screen.getByRole('button', { name: 'Ask side question' })).toBeDisabled()
      await act(async () => answer?.('**Use SQLite.**'))
      expect(within(thread()!).getByText('Use SQLite.').tagName).toBe('STRONG')
      expect(screen.getByRole('button', { name: 'Ask side question' })).toBeEnabled()
      expect(sendMessage).not.toHaveBeenCalled()
      expect(executeCommand).not.toHaveBeenCalled()

      fireEvent.keyDown(bar, { key: 'Escape' })
      expect(thread()).not.toBeInTheDocument()
      expect(screen.getByLabelText('Message')).toHaveValue('Keep this draft')
      expect(toggle).toHaveAttribute('aria-pressed', 'false')

      fireEvent.click(toggle)
      expect(within(thread()!).getByText('Use SQLite.')).toBeInTheDocument()
      expect(screen.getByLabelText('Side question')).toHaveValue('Typed while waiting')
      fireEvent.click(within(thread()!).getByRole('button', { name: 'Back to message' }))
      expect(screen.getByLabelText('Message')).toHaveValue('Keep this draft')
    })

    it('keeps history recall and dropped files away from the draft it is holding', async () => {
      const historySession: ManagedSession = {
        ...session,
        messages: [{
          id: 'history-user-1', role: 'user', content: 'Earlier prompt',
          createdAt: '2026-07-22T00:00:00.000Z',
        }],
      }
      vi.mocked(listComputers).mockResolvedValue([sideComputer])
      vi.mocked(listSessions).mockResolvedValue([historySession])
      vi.mocked(getSession).mockResolvedValue(historySession)
      render(<App />)
      fireEvent.change(await screen.findByLabelText('Message'), { target: { value: 'Keep this draft' } })
      fireEvent.click(await screen.findByRole('button', { name: 'Ask a side question' }))

      fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
      const file = new File(['audio'], 'idea.webm', { type: 'audio/webm' })
      const bar = screen.getByLabelText('Side question').closest('.composer')!
      const dataTransfer = { files: [file], types: ['Files'], dropEffect: 'copy' }
      // Not cancelled, the browser would open the file in place of the app.
      expect(fireEvent.dragOver(bar, { dataTransfer })).toBe(false)
      expect(dataTransfer.dropEffect).toBe('none')
      expect(fireEvent.drop(bar, { dataTransfer })).toBe(false)
      await act(async () => {})
      expect(transcribeAudio).not.toHaveBeenCalled()
      expect(uploadSessionFile).not.toHaveBeenCalled()
      expect(screen.getByLabelText('Side question')).toHaveValue('')

      fireEvent.keyDown(screen.getByLabelText('Side question'), { key: 'Escape' })
      expect(screen.getByLabelText('Message')).toHaveValue('Keep this draft')
    })

    it('puts the dock away on Escape before a knowledge panel beside it', async () => {
      vi.mocked(listComputers).mockResolvedValue([sideComputer])
      render(<App />)
      await screen.findByText('Hello agent')
      fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
      const knowledge = document.getElementById('knowledge-panel')!
      await waitFor(() => expect(knowledge).not.toHaveAttribute('hidden'))
      // With no roots yet, Knowledge opens on adding one; that dialog is on top.
      fireEvent.click(screen.getByRole('button', { name: 'Ask a side question' }))
      fireEvent.keyDown(document.body, { key: 'Escape' })
      expect(screen.queryByRole('dialog', { name: 'Add knowledge root' })).not.toBeInTheDocument()
      expect(thread()).toBeInTheDocument()
      const ask = screen.getByRole('button', { name: 'Ask side question' })
      ask.focus()

      fireEvent.keyDown(ask, { key: 'Escape' })
      expect(thread()).not.toBeInTheDocument()
      expect(knowledge).not.toHaveAttribute('hidden')

      fireEvent.click(screen.getByRole('button', { name: 'Ask a side question' }))
      fireEvent.keyDown(document.body, { key: 'Escape' })
      expect(thread()).not.toBeInTheDocument()
      expect(knowledge).not.toHaveAttribute('hidden')

      fireEvent.click(screen.getByRole('button', { name: 'Ask a side question' }))
      fireEvent.keyDown(knowledge, { key: 'Escape' })
      await waitFor(() => expect(knowledge).toHaveAttribute('hidden'))
      expect(thread()).toBeInTheDocument()
    })

    it('carries earlier answers with a follow-up', async () => {
      vi.mocked(listComputers).mockResolvedValue([sideComputer])
      const long = `Two options: SQLite and Postgres.${' More.'.repeat(4_000)}`
      vi.mocked(askSession)
        .mockResolvedValueOnce(long)
        .mockRejectedValueOnce(new Error('Model unavailable'))
        .mockResolvedValueOnce('Postgres needs a server.')
      render(<App />)
      await screen.findByText('Hello agent')
      fireEvent.click(await screen.findByRole('button', { name: 'Ask a side question' }))
      askFromBar('Which databases?')
      expect(await screen.findByText(/^Two options: SQLite and Postgres\./)).toBeInTheDocument()
      askFromBar('Fails?')
      expect(await within(thread()!).findByRole('alert')).toHaveTextContent('Model unavailable')
      askFromBar('And the second one?')

      expect(await screen.findByText('Postgres needs a server.')).toBeInTheDocument()
      expect(askSession).toHaveBeenLastCalledWith('computer-1', 'session-1', 'And the second one?', [
        { question: 'Which databases?', answer: long.slice(0, 16_000) },
      ])
      fireEvent.click(within(thread()!).getByRole('button', { name: 'Clear' }))
      expect(screen.queryByText('Postgres needs a server.')).not.toBeInTheDocument()
      expect(thread()).toBeInTheDocument()
    })

    it('keeps asking while another session is open and shows the answer on return', async () => {
      vi.mocked(listComputers).mockResolvedValue([sideComputer])
      vi.mocked(listSessions).mockResolvedValue([session, secondSession])
      vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
        sessionId === secondSession.id ? secondSession : session,
      )
      let answer: ((value: string) => void) | undefined
      vi.mocked(askSession).mockReturnValueOnce(new Promise((resolve) => { answer = resolve }))
      render(<App />)
      await screen.findByText('Hello agent')
      fireEvent.click(await screen.findByRole('button', { name: 'Ask a side question' }))
      askFromBar('Still there?')
      await waitFor(() => expect(askSession).toHaveBeenCalledOnce())

      fireEvent.click(screen.getByRole('button', { name: /^Second chat,/ }))
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /^Second chat,/ })).toHaveAttribute('aria-current', 'page'),
      )
      expect(thread()).not.toBeInTheDocument()
      expect(screen.getByLabelText('Message')).toBeInTheDocument()
      await act(async () => answer?.('Yes, still here.'))

      fireEvent.click(screen.getByRole('button', { name: /^Project chat,/ }))
      expect(await screen.findByText('Yes, still here.')).toBeInTheDocument()
      expect(screen.getByLabelText('Side question')).toBeInTheDocument()
    })

    it.each(['/ask Which file changed?', '/btw Which file changed?'])(
      'asks %s from the message bar instead of sending it',
      async (command) => {
        vi.mocked(listComputers).mockResolvedValue([sideComputer])
        vi.mocked(askSession).mockResolvedValueOnce('`src/App.tsx`')
        render(<App />)
        const textarea = await screen.findByLabelText('Message')
        fireEvent.change(textarea, { target: { value: command } })
        fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

        await waitFor(() =>
          expect(askSession).toHaveBeenCalledWith('computer-1', 'session-1', 'Which file changed?', []),
        )
        expect(await within(thread()!).findByText('src/App.tsx')).toBeInTheDocument()
        expect(screen.getByLabelText('Side question')).toHaveValue('')
        fireEvent.keyDown(screen.getByLabelText('Side question'), { key: 'Escape' })
        expect(screen.getByLabelText('Message')).toHaveValue('')
        expect(sendMessage).not.toHaveBeenCalled()
        expect(executeCommand).not.toHaveBeenCalled()
      },
    )

    it('opens an empty side question for a bare /ask', async () => {
      vi.mocked(listComputers).mockResolvedValue([sideComputer])
      render(<App />)
      const textarea = await screen.findByLabelText('Message')
      fireEvent.change(textarea, { target: { value: '/ask' } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

      expect(await screen.findByRole('region', { name: 'Side questions' })).toBeInTheDocument()
      expect(screen.getByLabelText('Side question')).toHaveValue('')
      expect(askSession).not.toHaveBeenCalled()
      expect(sendMessage).not.toHaveBeenCalled()
      expect(executeCommand).not.toHaveBeenCalled()
    })

    it('adds a line on Return on a phone and asks with Ctrl+Enter', async () => {
      vi.mocked(listComputers).mockResolvedValue([sideComputer])
      vi.mocked(askSession).mockResolvedValueOnce('Done.')
      const previousWidth = window.innerWidth
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 420 })
      try {
        render(<App />)
        await screen.findByText('Hello agent')
        fireEvent.click(await screen.findByRole('button', { name: 'Ask a side question' }))
        const bar = screen.getByLabelText('Side question')
        fireEvent.change(bar, { target: { value: 'Two lines?' } })
        expect(fireEvent.keyDown(bar, { key: 'Enter' })).toBe(true)
        expect(askSession).not.toHaveBeenCalled()
        fireEvent.keyDown(bar, { key: 'Enter', ctrlKey: true })
        await waitFor(() =>
          expect(askSession).toHaveBeenCalledWith('computer-1', 'session-1', 'Two lines?', []),
        )
      } finally {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: previousWidth })
      }
    })

    it('shows a failed side question and asks it again', async () => {
      vi.mocked(listComputers).mockResolvedValue([sideComputer])
      vi.mocked(askSession)
        .mockRejectedValueOnce(new Error('Model unavailable'))
        .mockResolvedValueOnce('Fine now.')
      render(<App />)
      await screen.findByText('Hello agent')
      fireEvent.click(await screen.findByRole('button', { name: 'Ask a side question' }))
      fireEvent.change(screen.getByLabelText('Side question'), {
        target: { value: 'Are tests passing?' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Ask side question' }))

      expect(await within(thread()!).findByRole('alert')).toHaveTextContent('Model unavailable')
      fireEvent.click(within(thread()!).getByRole('button', { name: 'Try again' }))

      expect(await within(thread()!).findByText('Fine now.')).toBeInTheDocument()
      expect(within(thread()!).queryByRole('alert')).not.toBeInTheDocument()
      expect(vi.mocked(askSession).mock.calls.map((call) => call[2]))
        .toEqual(['Are tests passing?', 'Are tests passing?'])
    })

    it('offers /ask only where the computer answers it and otherwise sends it on', async () => {
      render(<App />)
      const textarea = await screen.findByLabelText('Message')
      await waitFor(() => expect(listCommands).toHaveBeenCalled())
      fireEvent.change(textarea, { target: { value: '/' } })
      expect(await screen.findByRole('option', { name: /\/usage/ })).toBeInTheDocument()
      expect(screen.queryByRole('option', { name: /\/ask/ })).not.toBeInTheDocument()

      fireEvent.change(textarea, { target: { value: '/ask Which file?' } })
      fireEvent.keyDown(textarea, { key: 'Enter' })
      await waitFor(() =>
        expect(vi.mocked(sendMessage).mock.calls.length + vi.mocked(executeCommand).mock.calls.length)
          .toBe(1),
      )
      expect(askSession).not.toHaveBeenCalled()
      expect(thread()).not.toBeInTheDocument()
    })

    it('lists /ask where the computer answers side questions', async () => {
      vi.mocked(listComputers).mockResolvedValue([sideComputer])
      render(<App />)
      const textarea = await screen.findByLabelText('Message')
      await waitFor(() => expect(listCommands).toHaveBeenCalled())
      fireEvent.change(textarea, { target: { value: '/' } })
      expect(await screen.findByRole('option', { name: /\/ask/ })).toBeInTheDocument()
    })

    it('keeps a /ask question that cannot be asked yet in the bar', async () => {
      vi.mocked(listComputers).mockResolvedValue([sideComputer])
      vi.mocked(askSession).mockReturnValueOnce(new Promise(() => {}))
      render(<App />)
      const textarea = await screen.findByLabelText('Message')
      fireEvent.change(textarea, { target: { value: '/ask First?' } })
      fireEvent.keyDown(textarea, { key: 'Enter' })
      await waitFor(() => expect(askSession).toHaveBeenCalledTimes(1))
      fireEvent.keyDown(screen.getByLabelText('Side question'), { key: 'Escape' })

      fireEvent.change(screen.getByLabelText('Message'), { target: { value: '/ask Second?' } })
      fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Enter' })
      expect(await screen.findByLabelText('Side question')).toHaveValue('Second?')
      fireEvent.keyDown(screen.getByLabelText('Side question'), { key: 'Enter' })
      expect(askSession).toHaveBeenCalledTimes(1)
      fireEvent.change(screen.getByLabelText('Side question'), { target: { value: '' } })
      fireEvent.keyDown(screen.getByLabelText('Side question'), { key: 'Escape' })

      act(() => {
        MockWebSocket.instances[0]?.onmessage?.({
          data: JSON.stringify({ type: 'computer.updated', computer: { ...sideComputer, online: false } }),
        } as MessageEvent)
      })
      fireEvent.change(screen.getByLabelText('Message'), { target: { value: '/ask Offline?' } })
      fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Enter' })
      expect(await screen.findByLabelText('Side question')).toHaveValue('Offline?')
      expect(within(thread()!).getByText('Reconnect development to ask about this session.'))
        .toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Ask side question' })).toBeDisabled()
      expect(askSession).toHaveBeenCalledTimes(1)
    })

    it('forgets the answers of a session another client removed', async () => {
      vi.mocked(listComputers).mockResolvedValue([sideComputer])
      vi.mocked(listSessions).mockResolvedValue([session, secondSession])
      vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
        sessionId === secondSession.id ? secondSession : session,
      )
      vi.mocked(askSession).mockResolvedValueOnce('Remembered answer.')
      render(<App />)
      const textarea = await screen.findByLabelText('Message')
      fireEvent.change(textarea, { target: { value: '/ask Remember?' } })
      fireEvent.keyDown(textarea, { key: 'Enter' })
      expect(await screen.findByText('Remembered answer.')).toBeInTheDocument()

      act(() => {
        MockWebSocket.instances[0]?.onmessage?.({
          data: JSON.stringify({ type: 'session.removed', computerId: 'computer-1', sessionId: 'session-1' }),
        } as MessageEvent)
      })
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: /^Project chat,/ })).not.toBeInTheDocument(),
      )
      act(() => {
        MockWebSocket.instances[0]?.onmessage?.({
          data: JSON.stringify({ type: 'session.upserted', session }),
        } as MessageEvent)
      })
      fireEvent.click(await screen.findByRole('button', { name: /^Project chat,/ }))
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /^Project chat,/ })).toHaveAttribute('aria-current', 'page'),
      )
      expect(thread()).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Ask a side question' }))
      expect(await screen.findByRole('region', { name: 'Side questions' })).toBeInTheDocument()
      expect(screen.queryByText('Remembered answer.')).not.toBeInTheDocument()
    })

    it('drops /ask from the previous session while the next one lists its commands', async () => {
      const remoteSession: ManagedSession = {
        ...session,
        id: 'remote-session',
        computerId: secondComputer.id,
        computerName: secondComputer.name,
        title: 'Remote chat',
        messages: [],
      }
      vi.mocked(listComputers).mockResolvedValue([sideComputer, secondComputer])
      vi.mocked(listSessions).mockResolvedValue([session, remoteSession])
      vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
        sessionId === remoteSession.id ? remoteSession : session,
      )
      vi.mocked(listCommands).mockImplementation((computerId) => computerId === secondComputer.id
        ? new Promise(() => {})
        : Promise.resolve([
          { name: 'usage', description: 'Show usage', allowDuringAgentExecution: true },
          { name: 'ask', aliases: ['btw'], description: 'Ask a quick side question', allowDuringAgentExecution: true },
        ]))
      render(<App />)
      const textarea = await screen.findByLabelText('Message')
      fireEvent.change(textarea, { target: { value: '/' } })
      expect(await screen.findByRole('option', { name: /\/ask/ })).toBeInTheDocument()
      fireEvent.change(textarea, { target: { value: '' } })

      fireEvent.click(screen.getByRole('button', { name: /^Remote chat,/ }))
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /^Remote chat,/ })).toHaveAttribute('aria-current', 'page'),
      )
      await waitFor(() => expect(listCommands).toHaveBeenCalledWith(secondComputer.id, remoteSession.id))
      fireEvent.change(screen.getByLabelText('Message'), { target: { value: '/' } })
      expect(await screen.findByRole('option', { name: /\/usage/ })).toBeInTheDocument()
      expect(screen.queryByRole('option', { name: /\/ask/ })).not.toBeInTheDocument()
      fireEvent.change(screen.getByLabelText('Message'), { target: { value: '/b' } })
      await waitFor(() =>
        expect(screen.queryByRole('option', { name: /\/ask/ })).not.toBeInTheDocument(),
      )
      expect(thread()).not.toBeInTheDocument()
      expect(askSession).not.toHaveBeenCalled()
    })

    it('forgets the answers of a session an older partial snapshot removed', async () => {
      vi.mocked(listComputers).mockResolvedValue([sideComputer])
      vi.mocked(listSessions).mockResolvedValue([session, secondSession])
      vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
        sessionId === secondSession.id ? secondSession : session,
      )
      vi.mocked(askSession).mockResolvedValueOnce('Snapshot answer.')
      render(<App />)
      const textarea = await screen.findByLabelText('Message')
      fireEvent.change(textarea, { target: { value: '/ask Snapshot?' } })
      fireEvent.keyDown(textarea, { key: 'Enter' })
      expect(await screen.findByText('Snapshot answer.')).toBeInTheDocument()

      let finishOlder!: (value: Awaited<ReturnType<typeof listSessionListing>>) => void
      const calls = vi.mocked(listSessionListing).mock.calls.length
      vi.mocked(listSessionListing)
        .mockReturnValueOnce(new Promise((resolve) => { finishOlder = resolve }))
        .mockResolvedValueOnce({ sessions: [], answeredComputerIds: [] })
      act(() => { MockWebSocket.instances[0]?.onopen?.() })
      await waitFor(() => expect(listSessionListing).toHaveBeenCalledTimes(calls + 1))
      await act(async () => { MockWebSocket.instances[0]?.onopen?.() })
      await waitFor(() => expect(listSessionListing).toHaveBeenCalledTimes(calls + 2))
      await act(async () => { finishOlder({ sessions: [secondSession], answeredComputerIds: [computer.id] }) })
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: /^Project chat,/ })).not.toBeInTheDocument(),
      )

      act(() => {
        MockWebSocket.instances[0]?.onmessage?.({
          data: JSON.stringify({ type: 'session.upserted', session }),
        } as MessageEvent)
      })
      fireEvent.click(await screen.findByRole('button', { name: /^Project chat,/ }))
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /^Project chat,/ })).toHaveAttribute('aria-current', 'page'),
      )
      fireEvent.click(screen.getByRole('button', { name: 'Ask a side question' }))
      expect(await screen.findByRole('region', { name: 'Side questions' })).toBeInTheDocument()
      expect(screen.queryByText('Snapshot answer.')).not.toBeInTheDocument()
    })
  })

  it('closes the owning Copilot session after confirmation', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(sessionAction('Close session'))

    await waitFor(() => {
      expect(deleteSession).toHaveBeenCalledWith('computer-1', 'session-1')
    })
    expect(screen.queryByText('Hello agent')).not.toBeInTheDocument()
  })

  it('keeps the session chosen while another one was closing', async () => {
    const thirdSession: ManagedSession = {
      ...session,
      id: 'session-3',
      title: 'Third chat',
      cwd: '/home/tester/src/third',
      updatedAt: '2026-07-21T00:00:00.000Z',
      messages: [],
    }
    const listed = [session, secondSession, thirdSession]
    vi.mocked(listSessions).mockResolvedValue(listed)
    vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
      listed.find((entry) => entry.id === sessionId) || session,
    )
    let finishDelete: (() => void) | undefined
    vi.mocked(deleteSession).mockReturnValueOnce(new Promise<void>((resolve) => {
      finishDelete = resolve
    }))
    render(<App />)
    await screen.findByText('Hello agent')

    fireEvent.click(sessionAction('Close session'))
    await waitFor(() =>
      expect(deleteSession).toHaveBeenCalledWith('computer-1', 'session-1'),
    )
    fireEvent.click(screen.getByRole('button', { name: /^Third chat,/ }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /^Third chat,/ }))
        .toHaveAttribute('aria-current', 'page'),
    )

    await act(async () => {
      finishDelete?.()
      await Promise.resolve()
    })

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /^Project chat,/ })).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: /^Third chat,/ }))
      .toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: /^Second chat,/ }))
      .not.toHaveAttribute('aria-current')
  })

  it('moves a reader still on a closed session to a remaining one', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
      sessionId === secondSession.id ? secondSession : session,
    )
    render(<App />)
    await screen.findByText('Hello agent')

    fireEvent.click(sessionAction('Close session'))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /^Second chat,/ }))
        .toHaveAttribute('aria-current', 'page'),
    )
    expect(screen.queryByRole('button', { name: /^Project chat,/ })).not.toBeInTheDocument()
  })

  it('clears Copilot and UI history from the header and slash command', async () => {
    render(<App />)
    await screen.findByText('Hello agent')
    const textarea = screen.getByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Keep this draft' } })

    fireEvent.click(
      sessionAction('Clear conversation'),
    )
    await waitFor(() =>
      expect(clearConversation).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
      ),
    )
    await waitFor(() =>
      expect(screen.queryByText('Hello agent')).not.toBeInTheDocument(),
    )
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

    fireEvent.click(sessionAction('Restart session'))
    await waitFor(() =>
      expect(restartSession).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
      ),
    )
    expect(screen.getByText('Hello agent')).toBeInTheDocument()
  })

  it('lets an errored session restart from the session actions', async () => {
    const errored = {
      ...session,
      status: 'error' as const,
    }
    vi.mocked(listSessions).mockResolvedValue([errored])
    vi.mocked(getSession).mockResolvedValue(errored)
    vi.mocked(restartSession).mockResolvedValue({
      ...errored,
      status: 'idle',
    })
    render(<App />)
    await screen.findByText('Hello agent')

    const restart = sessionAction('Restart session')
    expect(restart).toBeEnabled()
    fireEvent.click(restart)

    await waitFor(() =>
      expect(restartSession).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
      ),
    )

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

  it('recovers an errored Copilot session and adopts the replacement state', async () => {
    const errored: ManagedSession = {
      ...session,
      status: 'error',
    }
    const recovered: ManagedSession = {
      ...errored,
      id: 'recovered-session',
      status: 'running',
      replacedSessionIds: [errored.id],
      messages: [
        ...errored.messages,
        {
          id: 'boundary',
          role: 'notice',
          content: 'Provider context was rebuilt. Earlier messages are read-only history.',
          createdAt: '2026-09-09T00:00:00.000Z',
        },
      ],
    }
    vi.mocked(listSessions).mockResolvedValue([errored])
    vi.mocked(getSession).mockResolvedValue(errored)
    vi.mocked(recoverConversation).mockResolvedValue(recovered)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)
    await screen.findByText('Hello agent')
    const textarea = screen.getByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Keep this recovery draft' } })

    fireEvent.click(sessionAction('Recover conversation'))

    await waitFor(() =>
      expect(recoverConversation).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        'provider-error',
      ),
    )
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining(
      'Old messages remain visible as read-only history',
    ))
    expect(await screen.findByText(/Provider context was rebuilt/)).toBeInTheDocument()
    expect(textarea).toHaveValue('Keep this recovery draft')
  })

  it('offers manual recovery for an idle Copilot session', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(listComputers).mockResolvedValue([taskComputer])

    render(<App />)
    await screen.findByText('Hello agent')
    const textarea = screen.getByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Keep this manual recovery draft' } })
    const recover = sessionAction('Recover conversation')
    await waitFor(() => expect(recover).toBeEnabled())
    fireEvent.click(recover)

    await waitFor(() =>
      expect(recoverConversation).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        'manual',
      ),
    )
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining(
      'Old messages remain visible as read-only history',
    ))
    expect(textarea).toHaveValue('Keep this manual recovery draft')
  })

  it.each([
    { state: 'running', selected: { ...session, status: 'running' as const } },
    { state: 'waiting', selected: { ...session, status: 'waiting' as const } },
    {
      state: 'waiting on stale input',
      selected: {
        ...session,
        status: 'waiting' as const,
        pendingUserInput: {
          requestId: 'stale-input',
          question: 'Expired question',
          choices: [],
          allowFreeform: true,
          stale: true,
        },
      },
    },
    { state: 'suspended', selected: { ...session, suspended: true } },
    { state: 'offline', selected: session, offline: true },
    {
      state: 'holding a live prompt',
      selected: {
        ...session,
        pendingPermission: {
          requestId: 'live-permission',
          title: 'Allow a live tool',
          options: [
            { optionId: 'allow', name: 'Allow', kind: 'allow_once' as const },
          ],
        },
      },
    },
    {
      state: 'holding an unconfirmed queue claim',
      selected: {
        ...session,
        queuedDispatch: {
          attemptId: 'attempt-1',
          promptId: 'prompt-1',
          content: 'Unconfirmed queue work',
          startedAt: '2026-09-16T20:00:00.000Z',
          state: 'uncertain' as const,
        },
      },
    },
    {
      state: 'rebuilding provider context',
      selected: {
        ...session,
        recoverySeedState: 'pending' as const,
      },
    },
    {
      state: 'showing a running tool',
      selected: {
        ...session,
        messages: [
          ...session.messages,
          {
            id: 'running-tool',
            role: 'activity' as const,
            content: 'Bash',
            createdAt: '2026-09-16T20:00:00.000Z',
            activityStatus: 'running' as const,
          },
        ],
      },
    },
  ])('keeps manual recovery visible but disabled while $state', async ({
    selected,
    offline,
  }) => {
    vi.mocked(listSessions).mockResolvedValue([selected])
    vi.mocked(getSession).mockResolvedValue(selected)
    if (offline) {
      vi.mocked(listComputers).mockResolvedValue([
        { ...computer, online: false },
      ])
    }

    render(<App />)
    await screen.findByText('Hello agent')

    expect(sessionAction('Recover conversation')).toBeDisabled()
    expect(recoverConversation).not.toHaveBeenCalled()
  })

  it.each(['queued', 'running'] as const)(
    'disables manual recovery while a background task is %s',
    async (status) => {
      vi.mocked(listComputers).mockResolvedValue([taskComputer])
      vi.mocked(listBackgroundTasks).mockResolvedValue({
        tasks: [{
          id: 'background-task',
          type: 'shell',
          description: 'Keep this work attached',
          status,
          startedAt: '2026-09-16T20:00:00.000Z',
          executionMode: 'background',
          canCancel: false,
        }],
        runningCount: status === 'running' ? 1 : 0,
        supported: true,
      })

      render(<App />)
      await screen.findByText('Hello agent')
      await waitFor(() => expect(listBackgroundTasks).toHaveBeenCalled())

      expect(sessionAction('Recover conversation')).toBeDisabled()
      expect(recoverConversation).not.toHaveBeenCalled()
    },
  )

  it('replaces stale SDK prompt controls with an inline recovery card', async () => {
    const stale: ManagedSession = {
      ...session,
      executionMode: 'sdk',
      status: 'error',
      pendingPermission: {
        requestId: 'stale-permission',
        title: 'Allow the expired tool request',
        stale: true,
        options: [
          { optionId: 'allow-once', name: 'Allow once', kind: 'allow_once' },
        ],
      },
    }
    vi.mocked(listSessions).mockResolvedValue([stale])
    vi.mocked(getSession).mockResolvedValue(stale)
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)

    expect(await screen.findByText('Allow the expired tool request')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Allow once' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Recover conversation' }))
    await waitFor(() =>
      expect(recoverConversation).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        'stale-sdk-interaction',
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

    await findSessionAction('Move session to tmux')
    fireEvent.click(
      sessionAction('Move session to tmux'),
    )

    await waitFor(() =>
      expect(moveSessionToTmux).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
      ),
    )
    openSessionActions()
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
    openSessionActions()
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

  it.each([
    ['desktop Enter', { key: 'Enter' }, false, false],
    ['Ctrl+Enter', { key: 'Enter', ctrlKey: true }, false, true],
    ['Cmd+Enter', { key: 'Enter', metaKey: true }, false, true],
    ['Queue message', undefined, true, true],
  ] as const)('anchors the selected session and timeline for %s', async (_name, key, running, enqueue) => {
    const target = running ? { ...session, status: 'running' as const } : session
    vi.mocked(listSessions).mockResolvedValue([target, secondSession])
    vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
      sessionId === secondSession.id ? secondSession : target,
    )
    let resolveSend!: (value: ManagedSession) => void
    vi.mocked(sendMessage).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSend = resolve
      }),
    )

    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    const timeline = document.querySelector<HTMLElement>('.timeline')!
    Object.defineProperties(timeline, {
      clientHeight: { configurable: true, value: 500 },
      scrollHeight: { configurable: true, value: 1_000 },
      scrollTop: { configurable: true, value: 100, writable: true },
    })
    fireEvent.scroll(timeline)
    const scrollIntoView = vi.mocked(Element.prototype.scrollIntoView)
    scrollIntoView.mockClear()

    fireEvent.change(textarea, { target: { value: 'follow this action' } })
    if (key) {
      fireEvent.keyDown(textarea, key)
    } else {
      fireEvent.click(screen.getByRole('button', { name: 'Queue message' }))
    }
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        {
          content: 'follow this action',
          enqueue: enqueue || running,
        },
      ),
    )
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'end' })
    expect(document.querySelector('.session-item--active')).toHaveTextContent(
      'Project chat',
    )

    scrollIntoView.mockClear()
    const live = {
      ...target,
      status: 'running' as const,
      updatedAt: '2026-07-22T00:00:10.000Z',
      messages: [
        ...target.messages,
        {
          id: 'accepted-action',
          role: 'user' as const,
          content: 'follow this action',
          createdAt: '2026-07-22T00:00:10.000Z',
        },
      ],
    }
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: live,
        }),
      } as MessageEvent)
    })
    expect(await screen.findByText('follow this action')).toBeInTheDocument()
    expect(document.querySelector('.session-item--active')).toHaveTextContent(
      'Project chat',
    )
    await waitFor(() =>
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'end' }),
    )

    scrollIntoView.mockClear()
    timeline.scrollTop = 100
    fireEvent.scroll(timeline)
    act(() => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({
          type: 'session.upserted',
          session: {
            ...live,
            messages: [
              ...live.messages,
              {
                id: 'passive-update',
                role: 'assistant' as const,
                content: 'Passive update',
                createdAt: '2026-07-22T00:00:11.000Z',
              },
            ],
          },
        }),
      } as MessageEvent)
    })
    expect(await screen.findByText('Passive update')).toBeInTheDocument()
    await act(async () => new Promise((resolve) => setTimeout(resolve, 10)))
    expect(scrollIntoView).not.toHaveBeenCalled()

    await act(async () => {
      resolveSend(live)
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
    ).toHaveAttribute('title', 'Send into the current response')
    const actionButtons = [...document.querySelectorAll('.composer-actions > .send-button')]
    expect(actionButtons).toHaveLength(5)
    expect(actionButtons.filter((button) => button.querySelector('.send-button__label')))
      .toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Queue message' })).not.toHaveTextContent('Queue')
    expect(
      screen.getByRole('button', { name: 'Stop response' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Stop response' })).not.toHaveTextContent('Stop')
  })

  it('keeps an in-flight submission selected when a refresh briefly omits it', async () => {
    let listed = [session, secondSession]
    vi.mocked(listSessionListing).mockImplementation(async () => ({
      sessions: listed,
      answeredComputerIds: [computer.id],
    }))
    let resolveSend!: (value: ManagedSession) => void
    vi.mocked(sendMessage).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSend = resolve
      }),
    )

    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'hold this session' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledExactlyOnceWith(
        'computer-1',
        'session-1',
        { content: 'hold this session', enqueue: false },
      ),
    )

    listed = [secondSession]
    act(() => {
      MockWebSocket.instances[0]?.onopen?.()
    })
    await waitFor(() => expect(listSessionListing).toHaveBeenCalledTimes(2))
    expect(new URLSearchParams(window.location.search).get('session')).toBe(
      'session-1',
    )
    await act(async () => new Promise((resolve) => setTimeout(resolve, 10)))

    listed = [session, secondSession]
    await act(async () => {
      resolveSend({
        ...session,
        updatedAt: '2026-07-22T00:00:10.000Z',
        messages: [
          ...session.messages,
          {
            id: 'held-session-response',
            role: 'assistant',
            content: 'The selected session is back',
            createdAt: '2026-07-22T00:00:10.000Z',
          },
        ],
      })
    })
    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get('session')).toBe(
        'session-1',
      ),
    )
  })

  it('keeps a rejected submission row available for its restored draft and error', async () => {
    let listed = [session, secondSession]
    vi.mocked(listSessionListing).mockImplementation(async () => ({
      sessions: listed,
      answeredComputerIds: [computer.id],
    }))
    let refuse!: (error: unknown) => void
    vi.mocked(sendMessage).mockImplementationOnce(
      () => new Promise((_resolve, reject) => {
        refuse = reject
      }),
    )

    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'restore this action' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())

    listed = [secondSession]
    act(() => {
      MockWebSocket.instances[0]?.onopen?.()
    })
    await waitFor(() => expect(listSessionListing).toHaveBeenCalledTimes(2))
    expect(document.querySelector('.session-item--active')).toHaveTextContent(
      'Project chat',
    )

    await act(async () => {
      refuse(new Error('Dispatch refused'))
    })
    await waitFor(() => expect(textarea).toHaveValue('restore this action'))
    expect(screen.getAllByText('Dispatch refused').length).toBeGreaterThan(0)
    expect(document.querySelector('.session-item--active')).toHaveTextContent(
      'Project chat',
    )
  })

  it('autocompletes and executes session slash commands', async () => {
    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    await waitFor(() => expect(listCommands).toHaveBeenCalled())

    fireEvent.change(textarea, { target: { value: '/mo' } })
    expect(await screen.findByText('/model')).toBeInTheDocument()
    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(textarea).toHaveValue('/model ')

    fireEvent.change(textarea, { target: { value: '/model fixture-model' } })
    expect(fireEvent.keyDown(textarea, { key: 'ArrowDown' })).toBe(true)
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await waitFor(() => {
      expect(executeCommand).toHaveBeenCalledWith('computer-1', 'session-1', {
        command: '/model fixture-model',
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
    fireEvent.change(textarea, { target: { value: '/model fixture-model' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })
    await waitFor(() => {
      expect(executeCommand).toHaveBeenCalledWith('computer-1', 'session-1', {
        command: '/model fixture-model',
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

  it('refreshes the model panel on reopening and retries a failed refresh', async () => {
    render(<App />)
    const open = await screen.findByRole('button', {
      name: 'Configure model, effort, and context',
    })
    fireEvent.click(open)
    await screen.findByLabelText('Model')
    expect(getRuntimeOptions).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    vi.mocked(getRuntimeOptions).mockRejectedValueOnce(
      new Error('Catalog refresh failed'),
    )
    fireEvent.click(open)
    expect(await screen.findByText('Catalog refresh failed')).toBeInTheDocument()
    expect(screen.queryByLabelText('Model')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    vi.mocked(getRuntimeOptions).mockResolvedValueOnce({
      current: {},
      status: 'idle',
      models: [{
        id: 'new-provider-model',
        name: 'New Provider Model',
        reasoningEfforts: ['high'],
        contextTiers: ['default'],
      }],
    })
    fireEvent.click(open)
    const model = await screen.findByLabelText('Model')
    expect(model).toHaveValue('new-provider-model')
    expect(within(model).getAllByRole('option')).toHaveLength(1)
    expect(getRuntimeOptions).toHaveBeenCalledTimes(3)
    expect(getRuntimeOptions).toHaveBeenLastCalledWith('computer-1', 'session-1')
    expect(configureRuntime).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Apply runtime settings' }))
    await waitFor(() =>
      expect(configureRuntime).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        {
          model: 'new-provider-model',
          reasoningEffort: 'high',
          contextTier: 'default',
          mode: 'interactive',
        },
      ),
    )
  })

  it('supports command abbreviations and configures the web status line', async () => {
      const runtimeSession = {
        ...session,
        runtime: {
          model: 'fixture-model',
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
        'fixture-model',
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
        'fixture-model',
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
            model: 'fixture-model',
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
        model: 'fixture-model',
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

    const confirm = vi
      .spyOn(window, 'confirm')
      .mockReturnValueOnce(false)
      .mockReturnValue(true)
    expect(
      screen.getByRole('region', { name: 'Manage Review the implementation' }),
    ).toHaveTextContent('Requests a clean stop from the owning runtime.')
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Stop task: Review the implementation',
      }),
    )
    expect(cancelBackgroundTask).not.toHaveBeenCalled()
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Stop task: Review the implementation',
      }),
    )
    expect(confirm).toHaveBeenCalledWith(
      'Stop "Review the implementation"?\n\nAny in-progress work from this task may be lost.',
    )
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
    confirm.mockRestore()
  })

  it('explains why a tracked running task cannot be stopped safely', async () => {
    vi.mocked(listBackgroundTasks).mockResolvedValue({
      tasks: [
        {
          id: 'detached-shell',
          type: 'shell',
          description: 'Long-running server',
          status: 'running',
          startedAt: '2026-08-31T18:00:00.000Z',
          command: 'pnpm dev',
          executionMode: 'background',
          attachmentMode: 'detached',
          canCancel: false,
        },
      ],
      runningCount: 1,
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
        '1 background task running',
      ),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'View background tasks' }),
    )

    const management = await screen.findByRole('region', {
      name: 'Manage Long-running server',
    })
    expect(management).toHaveTextContent('Stop unavailable.')
    expect(management).toHaveTextContent(
      'This detached task has no live stop handle.',
    )
    expect(
      within(management).queryByRole('button', {
        name: 'Stop task: Long-running server',
      }),
    ).not.toBeInTheDocument()
  })

  it('keeps a pending stop owned by its session and locks other stop actions', async () => {
    const task = (description: string) => ({
      id: 'shared-task-id',
      type: 'agent' as const,
      description,
      status: 'running' as const,
      startedAt: '2026-08-31T18:00:00.000Z',
      canCancel: true,
    })
    const firstTask = task('First session task')
    const secondTask = task('Second session task')
    const snapshot = (backgroundTask: typeof firstTask): BackgroundTaskSnapshot => ({
      tasks: [backgroundTask],
      runningCount: 1,
      supported: true,
    })
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(listComputers).mockResolvedValue([taskComputer])
    vi.mocked(getSession).mockImplementation(async (_computerId, sessionId) =>
      sessionId === secondSession.id
        ? { ...secondSession, executionMode: 'sdk' }
        : { ...session, executionMode: 'sdk' },
    )
    vi.mocked(listBackgroundTasks).mockImplementation(
      async (_computerId, sessionId) =>
        snapshot(sessionId === secondSession.id ? secondTask : firstTask),
    )
    let finishStop!: (value: BackgroundTaskSnapshot) => void
    vi.mocked(cancelBackgroundTask).mockReturnValue(
      new Promise((resolve) => {
        finishStop = resolve
      }),
    )
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)
    await waitFor(() =>
      expect(screen.getByTestId('web-statusline')).toHaveTextContent(
        '1 background task running',
      ),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'View background tasks' }),
    )
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Stop task: First session task',
      }),
    )
    expect(
      await screen.findByRole('button', {
        name: 'Stopping task: First session task',
      }),
    ).toBeDisabled()

    fireEvent.click(
      screen
        .getAllByRole('button', { name: /Second chat/ })
        .find((item) => item.classList.contains('session-item__open'))!,
    )
    const secondStop = await screen.findByRole('button', {
      name: 'Stop task: Second session task',
    })
    expect(secondStop).toBeDisabled()
    expect(
      screen.queryByRole('button', {
        name: 'Stopping task: Second session task',
      }),
    ).not.toBeInTheDocument()

    await act(async () => {
      finishStop({
        tasks: [{ ...firstTask, status: 'cancelled', canCancel: false }],
        runningCount: 0,
        supported: true,
      })
    })
    await waitFor(() => expect(secondStop).toBeEnabled())
    confirm.mockRestore()
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

  it('offers Queue while an SDK background agent runs', async () => {
    const sdkSession = {
      ...session,
      executionMode: 'sdk' as const,
    }
    vi.mocked(listSessions).mockResolvedValue([sdkSession])
    vi.mocked(getSession).mockResolvedValue(sdkSession)
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
      document.querySelector('.session-item .status-dot'),
    ).toHaveClass('status-dot--running')
    expect(
      screen.queryByRole('button', { name: 'Stop response' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Queue message' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Send message' }),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Wait for the background review' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Queue message' }))
    await waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith(
        'computer-1',
        'session-1',
        {
          content: 'Wait for the background review',
          enqueue: true,
        },
      ),
    )
  })

  it('does not offer the SDK background-agent Queue for tmux sessions', async () => {
    const tmuxSession = {
      ...session,
      executionMode: 'tmux' as const,
    }
    vi.mocked(listSessions).mockResolvedValue([tmuxSession])
    vi.mocked(getSession).mockResolvedValue(tmuxSession)
    vi.mocked(listComputers).mockResolvedValue([taskComputer])
    vi.mocked(listBackgroundTasks).mockResolvedValue({
      tasks: [
        {
          id: 'task-tmux',
          type: 'agent',
          description: 'Inspect the repository',
          status: 'running',
          startedAt: '2026-09-08T14:00:00.000Z',
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
        model: 'fixture-model',
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
          id: 'fixture-model',
          name: 'Fixture Model',
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
  it('follows workspace Markdown links without leaving the selected session', async () => {
    vi.mocked(readWorkspaceFile).mockImplementation(
      async (_computerId, _sessionId, path) => ({
        name: path.split('/').at(-1) || path,
        path,
        kind: 'markdown',
        mimeType: 'text/markdown',
        size: 100,
        content: path === 'README.md'
          ? '# Start\n\n[Read installation](docs/setup%20guide.md#install)'
          : '# Setup guide\n\n## Install\n\nInstall the application.',
      }),
    )
    render(<App />)
    const composer = await screen.findByLabelText('Message')
    fireEvent.change(composer, { target: { value: 'Keep this draft' } })
    fireEvent.click(screen.getByRole('button', {
      name: 'Browse current session folder',
    }))
    fireEvent.click(await screen.findByRole('button', { name: /README.md/ }))
    const location = window.location.href
    fireEvent.click(await screen.findByRole('link', { name: 'Read installation' }))

    const heading = await screen.findByRole('heading', { name: 'Install' })
    await waitFor(() => expect(heading).toHaveFocus())
    expect(readWorkspaceFile).toHaveBeenLastCalledWith(
      computer.id, session.id, 'docs/setup guide.md',
    )
    expect(window.location.href).toBe(location)
    expect(composer).toHaveValue('Keep this draft')
    expect(sendMessage).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Previous document' }))
    expect(await screen.findByRole('heading', { name: 'Start' }))
      .toBeInTheDocument()
  })

  it('previews exact HTML source in Session files without a document outline', async () => {
    const source = [
      '<!doctype html>',
      '<style>main { color: green }</style>',
      '<main style="padding: 12px">Session HTML</main>',
      '<audio controls src="data:audio/wav;base64,AAAA"></audio>',
    ].join('\n')
    vi.mocked(listWorkspace).mockResolvedValue({
      path: '.',
      entries: [
        {
          name: 'preview.html',
          path: 'preview.html',
          kind: 'html',
          size: source.length,
        },
      ],
    })
    vi.mocked(readWorkspaceFile).mockResolvedValue({
      name: 'preview.html',
      path: 'preview.html',
      kind: 'html',
      mimeType: 'text/html; charset=utf-8',
      size: source.length,
      content: source,
    })

    render(<App />)
    fireEvent.click(await screen.findByRole('button', {
      name: 'Browse current session folder',
    }))
    fireEvent.click(await screen.findByRole('button', { name: /preview.html/ }))

    const preview = await screen.findByTitle('Preview of preview.html')
    expect(preview).toBeInTheDocument()
    expect(new DOMParser().parseFromString(preview.getAttribute('srcdoc')!, 'text/html')
      .querySelector('audio, video, source, track')).toBeNull()
    expect(screen.getByRole('button', { name: 'Preview' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.queryByRole('button', { name: 'Document outline' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Source' }))
    expect(screen.queryByTitle('Preview of preview.html')).toBeNull()
    expect(
      document.querySelector('.workspace-preview__content > pre')?.textContent,
    ).toBe(source)

    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))
    expect(await screen.findByTitle('Preview of preview.html')).toBeInTheDocument()
  })

  it('previews exact HTML source in Knowledge', async () => {
    const source = '<article style="font: 16px sans-serif">Knowledge HTML</article>\n' +
      '<video controls><source src="data:video/mp4;base64,AAAA"></video>'
    mockKnowledgeRoots([knowledgeRoot])
    vi.mocked(listKnowledgeEntries).mockImplementation(knowledgeListings({
      '.': {
        path: '.',
        entries: [
          {
            name: 'reference.htm',
            path: 'reference.htm',
            kind: 'html',
            size: source.length,
          },
        ],
      },
    }))
    vi.mocked(readKnowledgeFile).mockResolvedValue({
      name: 'reference.htm',
      path: 'reference.htm',
      kind: 'html',
      mimeType: 'text/html; charset=utf-8',
      size: source.length,
      content: source,
    })

    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    fireEvent.click(
      await within(tree).findByRole('treeitem', { name: /reference.htm/ }),
    )

    const preview = await screen.findByTitle('Preview of reference.htm')
    expect(preview).toBeInTheDocument()
    expect(new DOMParser().parseFromString(preview.getAttribute('srcdoc')!, 'text/html')
      .querySelector('audio, video, source, track')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Source' }))
    expect(
      document.querySelector('.knowledge-reader .workspace-preview__content > pre')
        ?.textContent,
    ).toBe(source)
    expect(screen.queryByRole('button', { name: 'Document outline' })).toBeNull()
  })

  it('scopes Markdown fragments to unique headings and refuses escaping links', async () => {
    vi.mocked(readWorkspaceFile).mockResolvedValue({
      name: 'README.md',
      path: 'README.md',
      kind: 'markdown',
      mimeType: 'text/markdown',
      size: 100,
      content: [
        '# Start',
        '[Second install](#install-1)',
        '[Missing section](#missing)',
        '[Outside workspace](../outside.md)',
        '## Install',
        'First.',
        '## Install',
        'Second.',
        '## Install-1',
        'A naturally suffixed heading.',
      ].join('\n\n'),
    })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', {
      name: 'Browse current session folder',
    }))
    fireEvent.click(await screen.findByRole('button', { name: /README.md/ }))
    const headings = await screen.findAllByRole('heading', { name: 'Install' })
    expect(headings.map((heading) => heading.id)).toEqual(['install', 'install-1'])
    expect(screen.getByRole('heading', { name: 'Install-1' }))
      .toHaveAttribute('id', 'install-1-1')
    const location = window.location.href
    fireEvent.click(screen.getByRole('link', { name: 'Second install' }))
    expect(headings[1]).toHaveFocus()
    expect(window.location.href).toBe(location)

    fireEvent.click(screen.getByRole('link', { name: 'Missing section' }))
    expect(await screen.findByText('Section "missing" was not found in this document.'))
      .toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Outside workspace' }))
    expect(await screen.findByText('This link points outside the document root.'))
      .toBeInTheDocument()
    expect(readWorkspaceFile).toHaveBeenCalledTimes(1)
  })

  it('follows Knowledge Markdown links on the owning root and reports failed reads', async () => {
    mockKnowledgeRoots([{
      id: 'root-1',
      computerId: computer.id,
      computerName: computer.name,
      path: '/home/tester/docs',
      name: 'docs',
      createdAt: '2026-08-01T00:00:00.000Z',
    }])
    vi.mocked(listKnowledgeEntries).mockImplementation(knowledgeListings({
      '.': {
        path: '.',
        entries: [{ name: 'README.md', path: 'README.md', kind: 'markdown' }],
      },
    }))
    vi.mocked(readKnowledgeFile).mockImplementation(async (_root, path) => {
      if (path === 'missing.md') {
        throw new Error('Document was not found')
      }
      return {
        path,
        name: path.split('/').at(-1) || path,
        kind: 'markdown',
        mimeType: 'text/markdown',
        size: 100,
        content: path === 'README.md'
          ? '# Knowledge start\n\n[Open guide](guides/setup.md#r%C3%A9sum%C3%A9)'
          : '# Setup\n\n## Resume\n\n## R\u00e9sum\u00e9\n\n[Missing file](../missing.md)',
      }
    })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    fireEvent.click(await within(tree).findByRole('treeitem', { name: /README.md/ }))
    const location = window.location.href
    fireEvent.click(await screen.findByRole('link', { name: 'Open guide' }))
    const heading = await screen.findByRole('heading', { name: 'R\u00e9sum\u00e9' })
    await waitFor(() => expect(heading).toHaveFocus())
    expect(readKnowledgeFile).toHaveBeenLastCalledWith('root-1', 'guides/setup.md')
    const linkedLocation = new URL(location)
    linkedLocation.searchParams.set('file', 'guides/setup.md')
    expect(window.location.href).toBe(linkedLocation.toString())
    expect(sendMessage).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('link', { name: 'Missing file' }))
    expect(await screen.findAllByText('Document was not found')).not.toHaveLength(0)
    expect(heading).toBeInTheDocument()
    expect(window.location.href).toBe(linkedLocation.toString())
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
  describe('Knowledge-to-agent handoff', () => {
    const note: WorkspaceFile = {
      name: 'guide.md',
      path: 'guide.md',
      kind: 'markdown',
      mimeType: 'text/markdown',
      size: 80,
      content: '# Workspace guide\n\nKeep the agent and its context together.',
    }

    beforeEach(() => {
      mockKnowledgeRoots([knowledgeRoot])
      vi.mocked(listKnowledgeEntries).mockImplementation(knowledgeListings({
        '.': {
          path: '.',
          entries: [{ name: note.name, path: note.path, kind: 'markdown', size: note.size }],
        },
      }))
      vi.mocked(readKnowledgeFile).mockResolvedValue(note)
    })

    async function openNote() {
      fireEvent.click(await screen.findByRole('button', { name: 'Session knowledge' }))
      const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
      fireEvent.click(await within(tree).findByRole('treeitem', { name: /guide.md/ }))
      await screen.findByRole('heading', { name: 'Workspace guide' })
      return screen.getByRole('button', { name: 'Ask agent about file' })
    }

    it.each([
      { source: 'knowledge', action: 'save' },
      { source: 'knowledge', action: 'send' },
      { source: 'workspace', action: 'save' },
      { source: 'workspace', action: 'send' },
    ])(
      'preserves structured queued-edit ownership from hidden history through $source handoff and $action',
      async ({ source, action }) => {
        const { textarea, queuedSession, prompts, key } = await openTargetedQueueEditor()
        const pasted = Array.from({ length: 21 }, (_, index) => `  queued line ${index}`).join('\r\n')
        fireEvent.change(textarea, { target: { value: 'Queued ' } })
        textarea.setSelectionRange(textarea.value.length, textarea.value.length)
        fireEvent.paste(textarea, { clipboardData: { getData: () => pasted } })
        fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
        expect(textarea).toHaveValue('Hello agent')
        fireEvent.click(screen.getByRole('button', { name: 'Save to queue' }))
        fireEvent.click(screen.getByRole('button', { name: 'Send edited message' }))
        expect(updateQueuedPrompt).not.toHaveBeenCalled()
        expect(dispatchQueuedPrompt).not.toHaveBeenCalled()
        if (source === 'knowledge') {
          fireEvent.click(await openNote())
        } else {
          fireEvent.click(screen.getByRole('button', { name: 'Browse current session folder' }))
          fireEvent.click(await screen.findByRole('button', { name: /README.md/ }))
          fireEvent.click(await screen.findByRole('button', { name: 'Ask agent about file' }))
        }
        const path = source === 'knowledge' ? '/home/tester/docs/guide.md' : `${session.cwd}/README.md`
        const reference = `Please review \`${path}\` and help me with it.`
        expect(textarea).toHaveValue(`Queued [Paste #1 - 21 lines]\n\n${reference}`)
        const draft = JSON.parse(localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}')[key]
        expect(draft.queuedEdit).toEqual({ promptId: 'q2' })
        expect(draft.pastes[0].content).toBe(pasted)
        expect(draft.pendingSubmission).toBeUndefined()
        const expanded = `Queued ${pasted}\n\n${reference}`
        vi.mocked(updateQueuedPrompt).mockResolvedValue({
          session: { ...queuedSession, queuedPrompts: [prompts[0], { ...prompts[1], content: expanded }, prompts[2]] },
          prompt: { ...prompts[1], content: expanded },
        })
        vi.mocked(dispatchQueuedPrompt).mockResolvedValue({
          outcome: 'sent', promptId: 'q2', attemptId: 'handoff-attempt',
          session: { ...queuedSession, queuedPrompts: [prompts[0], prompts[2]], queuedCount: 2 },
        })
        fireEvent.click(screen.getByRole('button', { name: action === 'save' ? 'Save to queue' : 'Send edited message' }))
        await waitFor(() => expect(action === 'save' ? updateQueuedPrompt : dispatchQueuedPrompt)
          .toHaveBeenCalledExactlyOnceWith(computer.id, session.id, 'q2', expanded))
        expect(sendMessage).not.toHaveBeenCalled()
        expect(removeQueuedPrompt).not.toHaveBeenCalled()
        expect(executeCommand).not.toHaveBeenCalled()
      },
    )

    it.each(['sent', 'refused', 'uncertain', 'receipt-cleanup-failure'] as const)(
      'preserves pending queued identity, newer pasted handoff and replacement lineage on %s',
      async (outcome) => {
        const { rendered, textarea, queuedSession, prompts, key } = await openTargetedQueueEditor()
        const outgoing = Array.from({ length: 21 }, (_, index) => `outgoing ${index}`).join('\n')
        const newer = Array.from({ length: 22 }, (_, index) => `newer ${index}`).join('\n')
        fireEvent.change(textarea, { target: { value: 'Outgoing ' } })
        textarea.setSelectionRange(textarea.value.length, textarea.value.length)
        fireEvent.paste(textarea, { clipboardData: { getData: () => outgoing } })
        let finish!: (result: Awaited<ReturnType<typeof dispatchQueuedPrompt>>) => void
        const dispatch = new Promise<Awaited<ReturnType<typeof dispatchQueuedPrompt>>>((resolve) => { finish = resolve })
        vi.mocked(dispatchQueuedPrompt).mockReturnValueOnce(dispatch)
        fireEvent.click(screen.getByRole('button', { name: 'Send edited message' }))
        await waitFor(() => expect(dispatchQueuedPrompt).toHaveBeenCalledOnce())
        expect(vi.mocked(dispatchQueuedPrompt).mock.results[0].value).toBe(dispatch)
        const pending = JSON.parse(localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}')[key].pendingSubmission
        expect(pending).toMatchObject({ queuedPromptId: 'q2', originKey: key })
        fireEvent.change(textarea, { target: { value: 'Newer ' } })
        textarea.setSelectionRange(textarea.value.length, textarea.value.length)
        fireEvent.paste(textarea, { clipboardData: { getData: () => newer } })
        fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
        fireEvent.click(await openNote())
        const reference = 'Please review `/home/tester/docs/guide.md` and help me with it.'
        const display = `Newer [Paste #1 - 22 lines]\n\n${reference}`
        expect(textarea).toHaveValue(display)
        const staged = JSON.parse(localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}')[key]
        expect(staged.pendingSubmission).toEqual(pending)
        expect(staged.queuedEdit).toEqual({ promptId: 'q2', dispatchPending: true })

        const accepted = outcome === 'sent' || outcome === 'receipt-cleanup-failure'
        const replacement = { ...queuedSession, id: 'queued-replacement' }
        const final = { ...queuedSession, id: 'queued-final',
          ...(accepted ? { queuedPrompts: [prompts[0], prompts[2]], queuedCount: 2 } : {}),
        }
        vi.mocked(getSession).mockImplementation(async (_computer, id) =>
          id === final.id ? final : id === replacement.id ? replacement : queuedSession,
        )
        await act(async () => {
          for (const [from, to] of [[queuedSession, replacement], [replacement, final]]) {
            MockWebSocket.instances.at(-1)?.onmessage?.({
              data: JSON.stringify({ type: 'session.removed', computerId: computer.id, sessionId: from.id, replacedBy: to.id }),
            } as MessageEvent)
            MockWebSocket.instances.at(-1)?.onmessage?.({
              data: JSON.stringify({ type: 'session.upserted', session: to }),
            } as MessageEvent)
          }
        })
        const finalKey = `${computer.id}:${final.id}`
        await waitFor(() => expect(window.location.search).toContain(`session=${final.id}`))
        expect(JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}',
        )[finalKey].pendingSubmission).toEqual(pending)
        const setItem = Storage.prototype.setItem
        const storage = outcome === 'receipt-cleanup-failure'
          ? vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, storageKey, value) {
              if (this === localStorage && storageKey === 'agentic-remote:composer-drafts-v2') {
                throw new DOMException('Receipt cleanup blocked', 'QuotaExceededError')
              }
              setItem.call(this, storageKey, value)
            })
          : undefined
        try {
          await act(async () => finish(accepted
            ? { outcome: 'sent', promptId: 'q2', attemptId: 'handoff-attempt',
                session: { ...queuedSession, queuedPrompts: [prompts[0], prompts[2]], queuedCount: 2 } }
            : outcome === 'refused'
              ? { outcome: 'refused', promptId: 'q2', attemptId: 'handoff-attempt', restored: true, session: queuedSession }
              : { outcome: 'uncertain', promptId: 'q2', attemptId: 'handoff-attempt', delivery: 'unknown', session: queuedSession }))
          const expected = `${accepted ? '' : `Outgoing ${outgoing}\n\n`}Newer ${newer}\n\n${reference}`
          if (accepted) expect(screen.getByLabelText('Message')).toHaveValue(display)
          if (outcome === 'uncertain') {
            expect(screen.getByRole('button', { name: 'Send edited message' })).toBeDisabled()
            expect(screen.getByLabelText('Message')).toHaveAccessibleDescription(/Queued delivery is pending or unconfirmed/)
          }
          if (outcome === 'receipt-cleanup-failure') {
            expect(JSON.parse(
              localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}',
            )[finalKey].pendingSubmission).toEqual(pending)
            expect(
              localStorage.getItem('agentic-remote:composer-drafts-generation'),
              JSON.stringify({
                storageWarning: document.querySelector('#composer-storage-warning')?.textContent,
                error: document.querySelector('.error-banner')?.textContent,
                dispatchCalls: vi.mocked(dispatchQueuedPrompt).mock.calls.length,
              }),
            ).toContain(pending.id)
          }
          rendered.unmount()
          vi.mocked(listSessions).mockResolvedValue([final])
          render(<App />)
          await screen.findByLabelText('Message')
          expect(JSON.parse(localStorage.getItem('agentic-remote:composer-drafts') || '{}')[finalKey]).toBe(expected)
          if (outcome !== 'receipt-cleanup-failure') {
            const saved = JSON.parse(localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}')[finalKey]
            expect(saved.pendingSubmission).toBeUndefined()
            expect(saved.queuedEdit).toEqual(accepted
              ? undefined
              : { promptId: 'q2', ...(outcome === 'uncertain' ? { dispatchPending: true } : {}) })
          }
          expect(dispatchQueuedPrompt).toHaveBeenCalledOnce()
          expect(sendMessage).not.toHaveBeenCalled()
        } finally {
          storage?.mockRestore()
        }
      },
    )

    it.each(['knowledge', 'workspace'] as const)(
      'navigates each repeated, colliding and reference heading in the %s outline',
      async (source) => {
        const content = [
          '# Workspace guide',
          '## Repeat',
          '## Repeat',
          '## Repeat-1',
          '#',
          '## Section',
          '## [Repeat][known]',
          '## [Unknown][missing]',
          '[known]: https://example.invalid/reference',
        ].join('\n\n')
        vi.mocked(readKnowledgeFile).mockResolvedValue({ ...note, content })
        vi.mocked(readWorkspaceFile).mockResolvedValue({
          ...note, name: 'README.md', path: 'README.md', content,
        })
        render(<App />)
        const composer = await screen.findByLabelText('Message')
        fireEvent.change(composer, { target: { value: 'Keep this draft' } })
        if (source === 'knowledge') {
          await openNote()
        } else {
          fireEvent.click(screen.getByRole('button', { name: 'Browse current session folder' }))
          fireEvent.click(await screen.findByRole('button', { name: /README.md/ }))
          await screen.findByRole('heading', { name: 'Workspace guide' })
        }
        const document = window.document.querySelector('.workspace-preview__content')!
        const headings = [...document.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')]
        expect(headings.map((heading) => heading.id)).toEqual([
          'workspace-guide', 'repeat', 'repeat-1', 'repeat-1-1',
          'section', 'section-1', 'repeat-2', 'unknownmissing',
        ])
        // The address follows the opened document in an effect that runs
        // after the heading is painted. Recorded before it settled, a busy run
        // saw it change during the outline clicks below.
        await act(async () => undefined)
        if (source === 'knowledge') {
          await waitFor(() => expect(new URL(window.location.href).searchParams.get('file')).toBe('guide.md'))
        }
        const location = window.location.href
        for (const [entry, index] of [0, 1, 2, 3, 5, 6, 7].entries()) {
          fireEvent.click(screen.getByRole('button', { name: 'Document outline' }))
          const outline = screen.getByRole('navigation', { name: 'Document outline' })
          const buttons = within(outline).getAllByRole('button')
            .filter((button) => button.classList.contains('document-outline__item'))
          expect(buttons).toHaveLength(7)
          fireEvent.click(buttons[entry])
          expect(headings[index]).toHaveFocus()
        }
        expect(composer).toHaveValue('Keep this draft')
        expect(window.location.href).toBe(location)
        expect(sendMessage).not.toHaveBeenCalled()
      },
    )

    it.each(['knowledge', 'workspace'] as const)(
      'appends %s references to the hidden recovery draft, not its history preview',
      async (source) => {
        const pasted = Array.from({ length: 21 }, (_, index) => `recovered ${index}`).join('\r\n')
        const failed = {
          ...session,
          failedPrompt: {
            content: 'Recover this prompt',
            failedAt: '2026-09-05T00:00:00.000Z',
          },
        }
        vi.mocked(listSessions).mockResolvedValue([failed])
        vi.mocked(getSession).mockResolvedValue(failed)
        const rendered = render(<App />)
        const composer = (await screen.findByLabelText('Message')) as HTMLTextAreaElement
        await waitFor(() => expect(composer).toHaveValue(failed.failedPrompt.content))
        composer.setSelectionRange(0, composer.value.length)
        fireEvent.paste(composer, { clipboardData: { getData: () => pasted } })
        fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
        expect(composer).toHaveValue('Hello agent')

        if (source === 'knowledge') {
          fireEvent.click(await openNote())
        } else {
          fireEvent.click(screen.getByRole('button', { name: 'Browse current session folder' }))
          fireEvent.click(await screen.findByRole('button', { name: /README.md/ }))
          fireEvent.click(await screen.findByRole('button', { name: 'Ask agent about file' }))
        }
        const path = source === 'knowledge'
          ? '/home/tester/docs/guide.md'
          : '/home/tester/src/project/README.md'
        const reference = `Please review \`${path}\` and help me with it.`
        const display = `[Paste #1 - 21 lines]\n\n${reference}`
        expect(composer).toHaveValue(display)
        expect(sendMessage).not.toHaveBeenCalled()
        expect(executeCommand).not.toHaveBeenCalled()
        const saved = JSON.parse(localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}')
        expect(saved['computer-1:session-1'].pastes).toHaveLength(1)
        expect(saved['computer-1:session-1'].pastes[0].content).toBe(pasted)
        expect(JSON.parse(
          localStorage.getItem('agentic-remote:composer-draft-failures') || '{}',
        )['computer-1:session-1']).toBe(failed.failedPrompt.failedAt)

        rendered.unmount()
        render(<App />)
        expect(await screen.findByLabelText('Message')).toHaveValue(display)
        fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
        await waitFor(() =>
          expect(sendMessage).toHaveBeenLastCalledWith(computer.id, session.id, {
            content: `${pasted}\n\n${reference}`,
            enqueue: false,
            acknowledgesFailure: failed.failedPrompt.failedAt,
          }),
        )
      },
    )

    it.each([
      { enqueue: false, accepted: true },
      { enqueue: true, accepted: true },
      { enqueue: false, accepted: false },
      { enqueue: true, accepted: false },
    ])(
      'keeps a file handoff and newer pastes through replacement and settlement ($enqueue, $accepted)',
      async ({ enqueue, accepted }) => {
        const original = Array.from({ length: 21 }, (_, index) => `submitted ${index}`).join('\n')
        const newer = Array.from({ length: 22 }, (_, index) => `newer ${index}`).join('\n')
        const running = { ...session, status: 'running' as const }
        const replacement = { ...running, id: 'replacement-1' }
        const final = { ...running, id: 'replacement-2' }
        vi.mocked(listSessions).mockResolvedValue([running])
        vi.mocked(getSession).mockImplementation(async (_computerId, id) =>
          id === final.id ? final : id === replacement.id ? replacement : running,
        )
        let resolveSend!: (value: ManagedSession) => void
        let rejectSend!: (reason: Error) => void
        vi.mocked(sendMessage).mockReturnValueOnce(new Promise((resolve, reject) => {
          resolveSend = resolve
          rejectSend = reject
        }))
        const rendered = render(<App />)
        const composer = (await screen.findByLabelText('Message')) as HTMLTextAreaElement
        fireEvent.paste(composer, { clipboardData: { getData: () => original } })
        fireEvent.click(screen.getByRole('button', { name: enqueue ? 'Queue message' : 'Send message' }))
        await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
        const pending = JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}',
        )['computer-1:session-1'].pendingSubmission
        fireEvent.change(composer, { target: { value: 'Newer ' } })
        composer.setSelectionRange(composer.value.length, composer.value.length)
        fireEvent.paste(composer, { clipboardData: { getData: () => newer } })
        fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
        expect(composer).toHaveValue('Hello agent')
        fireEvent.click(await openNote())
        const reference = 'Please review `/home/tester/docs/guide.md` and help me with it.'
        expect(composer).toHaveValue(`Newer [Paste #1 - 22 lines]\n\n${reference}`)
        expect(JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}',
        )['computer-1:session-1'].pendingSubmission).toEqual(pending)
        expect(sendMessage).toHaveBeenCalledOnce()

        await act(async () => {
          for (const [from, to] of [[running, replacement], [replacement, final]]) {
            MockWebSocket.instances.at(-1)?.onmessage?.({
              data: JSON.stringify({
                type: 'session.removed',
                computerId: computer.id,
                sessionId: from.id,
                replacedBy: to.id,
              }),
            } as MessageEvent)
            MockWebSocket.instances.at(-1)?.onmessage?.({
              data: JSON.stringify({ type: 'session.upserted', session: to }),
            } as MessageEvent)
          }
        })
        await waitFor(() => expect(window.location.search).toContain(`session=${final.id}`))
        await act(async () => {
          if (accepted) resolveSend(running)
          else rejectSend(new Error('Delivery could not be confirmed by fixture'))
        })
        const saved = JSON.parse(localStorage.getItem('agentic-remote:composer-drafts-v2') || '{}')
        expect(saved['computer-1:session-1']).toBeUndefined()
        expect(saved['computer-1:replacement-1']).toBeUndefined()
        expect(saved['computer-1:replacement-2'].pendingSubmission).toBeUndefined()
        const expected = `${accepted ? '' : `${original}\n\n`}Newer ${newer}\n\n${reference}`
        expect(JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts') || '{}',
        )['computer-1:replacement-2']).toBe(expected)
        const display = (screen.getByLabelText('Message') as HTMLTextAreaElement).value
        expect(saved['computer-1:replacement-2'].pastes).toHaveLength(accepted ? 1 : 2)
        expect(display).not.toContain('Hello agent')
        rendered.unmount()
        vi.mocked(listSessions).mockResolvedValue([final])
        render(<App />)
        await screen.findByLabelText('Message')
        expect(JSON.parse(
          localStorage.getItem('agentic-remote:composer-drafts') || '{}',
        )['computer-1:replacement-2']).toBe(expected)
        expect(sendMessage).toHaveBeenCalledOnce()
      },
    )

    it('warns rather than authorizing a send when a file handoff cannot save its draft', async () => {
      render(<App />)
      const composer = await screen.findByLabelText('Message')
      fireEvent.change(composer, { target: { value: 'Unsent draft' } })
      fireEvent.keyDown(document.querySelector('.app-shell')!, { key: 'ArrowUp' })
      const ask = await openNote()
      const setItem = Storage.prototype.setItem
      const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
        function (this: Storage, key, value) {
          if (this === localStorage && key.startsWith('agentic-remote:composer')) {
            throw new DOMException('Fixture storage is full', 'QuotaExceededError')
          }
          setItem.call(this, key, value)
        },
      )
      try {
        fireEvent.click(ask)
        expect(composer).toHaveValue(
          'Unsent draft\n\nPlease review `/home/tester/docs/guide.md` and help me with it.',
        )
        expect(screen.getByText(/Draft changes could not be saved/)).toBeVisible()
        fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
        expect(sendMessage).not.toHaveBeenCalled()
        expect(screen.getByText(/Message was not sent/)).toBeVisible()
      } finally {
        storage.mockRestore()
      }
      fireEvent.change(composer, { target: { value: 'Saved after repair' } })
      expect(screen.queryByText(/could not be saved/)).toBeNull()
      expect(sendMessage).not.toHaveBeenCalled()
    })

    it('keeps an unreadable initial draft untouched when adding a file reference', async () => {
      const saved = JSON.stringify({ 'computer-1:session-1': { text: 'Saved original', pastes: [] } })
      localStorage.setItem('agentic-remote:composer-drafts-v2', saved)
      localStorage.setItem('agentic-remote:composer-drafts-generation', '1')
      localStorage.setItem('agentic-remote:composer-drafts', JSON.stringify({
        'computer-1:session-1': 'Saved original',
      }))
      const getItem = Storage.prototype.getItem
      const storage = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
        function (this: Storage, key) {
          if (this === localStorage && key.startsWith('agentic-remote:composer')) {
            throw new DOMException('Fixture read denied', 'SecurityError')
          }
          return getItem.call(this, key)
        },
      )
      let rendered: ReturnType<typeof render> | undefined
      try {
        rendered = render(<App />)
        const composer = await screen.findByLabelText('Message')
        fireEvent.change(composer, { target: { value: 'New editable text' } })
        fireEvent.click(await openNote())
        expect(composer).toHaveValue(
          'New editable text\n\nPlease review `/home/tester/docs/guide.md` and help me with it.',
        )
        fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
        expect(sendMessage).not.toHaveBeenCalled()
        expect(getItem.call(localStorage, 'agentic-remote:composer-drafts-v2')).toBe(saved)
        expect(screen.getByText(/Message was not sent/)).toBeVisible()
      } finally {
        storage.mockRestore()
        rendered?.unmount()
      }
      render(<App />)
      expect(await screen.findByLabelText('Message')).toHaveValue('Saved original')
      expect(sendMessage).not.toHaveBeenCalled()
    })

    it('does not steal focus from a dialog opened before the handoff focus frame', async () => {
      render(<App />)
      const ask = await openNote()
      const frames: FrameRequestCallback[] = []
      const animation = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
        frames.push(callback)
        return frames.length
      })
      try {
        fireEvent.click(ask)
        fireEvent.click(sessionAction('Rename session'))
        const name = screen.getByLabelText('Session name')
        expect(name).toHaveFocus()
        act(() => {
          while (frames.length) frames.shift()!(0)
        })
        expect(name).toHaveFocus()
      } finally {
        animation.mockRestore()
      }
    })

    it('disables a cached session-file handoff when its owning computer goes offline', async () => {
      render(<App />)
      fireEvent.click(await screen.findByRole('button', { name: 'Browse current session folder' }))
      fireEvent.click(await screen.findByRole('button', { name: /README.md/ }))
      const ask = await screen.findByRole('button', { name: 'Ask agent about file' })
      act(() => {
        MockWebSocket.instances.at(-1)?.onmessage?.({
          data: JSON.stringify({
            type: 'computer.updated',
            computer: { ...computer, online: false },
          }),
        } as MessageEvent)
      })
      expect(ask).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Insert path' })).toBeDisabled()
      expect(screen.getByText('Reconnect development to add a file reference.')).toBeVisible()
      expect(sendMessage).not.toHaveBeenCalled()
      expect(screen.getByLabelText('Message')).toHaveValue('')
    })

    it('reloads session-file ownership when the same session changes working folder', async () => {
      render(<App />)
      fireEvent.click(await screen.findByRole('button', { name: 'Browse current session folder' }))
      fireEvent.click(await screen.findByRole('button', { name: /README.md/ }))
      await screen.findByRole('button', { name: 'Ask agent about file' })
      act(() => {
        MockWebSocket.instances.at(-1)?.onmessage?.({
          data: JSON.stringify({
            type: 'session.upserted',
            session: { ...session, cwd: '/home/tester/new-project' },
          }),
        } as MessageEvent)
      })
      expect(screen.queryByRole('button', { name: 'Ask agent about file' })).toBeNull()
      fireEvent.click(await screen.findByRole('button', { name: /README.md/ }))
      fireEvent.click(await screen.findByRole('button', { name: 'Ask agent about file' }))
      expect(screen.getByLabelText('Message')).toHaveValue(
        'Please review `/home/tester/new-project/README.md` and help me with it.',
      )
      expect(sendMessage).not.toHaveBeenCalled()
    })

    it.each([390, 1280])(
      'preserves the document, anchor, tree offset and reader preference through a handoff at %ipx',
      async (width) => {
        const previousWidth = window.innerWidth
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
        localStorage.setItem('agentic-remote:reader-width', '760')
        vi.mocked(readKnowledgeFile).mockImplementation(async (_root, path) => ({
          ...note,
          path,
          name: path,
          content: '# Workspace guide\n\n[Go to details](section.md#details)\n\n## Details\n\nKeep this section.',
        }))
        try {
          render(<App />)
          await openNote()
          fireEvent.click(screen.getByRole('link', { name: 'Go to details' }))
          await waitFor(() => expect(readKnowledgeFile).toHaveBeenCalledTimes(2))
          await act(async () => {
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
          })
          const content = document.querySelector<HTMLElement>('.knowledge-reader .workspace-preview__content')!
          const tree = screen.getByRole('navigation', { name: 'Knowledge' })
          content.scrollTop = 270
          tree.scrollTop = 70
          fireEvent.scroll(tree)
          if (width > 960) {
            fireEvent.click(screen.getByRole('button', { name: 'Expand knowledge panel' }))
          }
          fireEvent.click(screen.getByRole('button', { name: 'Ask agent about file' }))
          if (width <= 960) {
            fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
          }
          await act(async () => {
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
          })
          expect(document.querySelector('.knowledge-reader .workspace-preview__content')).toBe(content)
          expect(content.scrollTop).toBe(270)
          expect(screen.getByRole('navigation', { name: 'Knowledge' }).scrollTop).toBe(70)
          expect(screen.getByRole('heading', { name: 'Details' })).toBeVisible()
          expect(readKnowledgeFile).toHaveBeenCalledTimes(width <= 960 ? 3 : 4)
          expect(localStorage.getItem('agentic-remote:reader-width')).toBe('760')
          expect(sendMessage).not.toHaveBeenCalled()
          expect(window.location.hash).toBe('')
        } finally {
          Object.defineProperty(window, 'innerWidth', { configurable: true, value: previousWidth })
        }
      },
    )

    it('keeps drafts, queued work, selection and reading positions when the current session is filtered out', async () => {
      const queued = {
        ...session,
        queuedCount: 1,
        queuedPrompts: [{ id: 'queued', content: 'Keep this queued work', createdAt: session.updatedAt }],
      }
      vi.mocked(listSessions).mockResolvedValue([queued])
      vi.mocked(getSession).mockResolvedValue(queued)
      vi.mocked(listComputers).mockResolvedValue([
        computer,
        { ...secondComputer, online: false },
        { ...secondComputer, id: 'empty-computer', name: 'Empty computer' },
      ])
      render(<App />)
      const composer = await screen.findByLabelText('Message')
      fireEvent.change(composer, { target: { value: 'Do not replace this draft' } })
      await openNote()
      const content = document.querySelector<HTMLElement>('.knowledge-reader .workspace-preview__content')!
      await act(async () => {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      })
      content.scrollTop = 175
      const savedDraft = localStorage.getItem('agentic-remote:composer-drafts-v2')
      const savedPosition = localStorage.getItem('agentic-remote:knowledge-session-positions')
      const address = window.location.search
      const search = screen.getByRole('searchbox', { name: 'Search sessions' })
      fireEvent.change(search, { target: { value: 'no matching session' } })
      fireEvent.click(screen.getByRole('button', { name: 'Needs you' }))
      for (const name of [computer.name, secondComputer.name, 'Empty computer']) {
        expect(screen.getByRole('region', { name })).toBeVisible()
      }
      expect(screen.getByRole('status', { name: 'Session filter results' })).toHaveTextContent('0 of 1 sessions')
      expect(composer).toHaveValue('Do not replace this draft')
      expect(content.scrollTop).toBe(175)
      expect(screen.getByText('Keep this queued work')).toBeVisible()
      expect(localStorage.getItem('agentic-remote:composer-drafts-v2')).toBe(savedDraft)
      expect(localStorage.getItem('agentic-remote:knowledge-session-positions')).toBe(savedPosition)
      expect(window.location.search).toBe(address)
      fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
      expect(screen.getByRole('button', { name: /^Project chat,/ })).toHaveAttribute('aria-current', 'page')
      expect(sendMessage).not.toHaveBeenCalled()
      expect(removeQueuedPrompt).not.toHaveBeenCalled()
    })

    it('appends the owning-root path to the existing draft without sending', async () => {
      render(<App />)
      const composer = await screen.findByLabelText('Message')
      fireEvent.change(composer, { target: { value: 'My existing question' } })
      const ask = await openNote()
      fireEvent.click(screen.getByRole('button', { name: 'Expand knowledge panel' }))
      fireEvent.click(ask)
      expect(composer).toHaveValue(
        'My existing question\n\nPlease review `/home/tester/docs/guide.md` and help me with it.',
      )
      expect(document.querySelector('.workspace')).toHaveClass('workspace--docked')
      expect(sendMessage).not.toHaveBeenCalled()
      expect(screen.getByRole('heading', { name: 'Workspace guide' })).toBeVisible()
      await waitFor(() => expect(composer).toHaveFocus())
    })

    it('reveals the phone conversation while keeping the document available to reopen', async () => {
      const originalWidth = window.innerWidth
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
      try {
        render(<App />)
        const ask = await openNote()
        fireEvent.click(ask)
        expect(document.querySelector('.workspace')).toHaveClass('workspace--hidden')
        expect(screen.getByLabelText('Message')).toHaveValue(
          'Please review `/home/tester/docs/guide.md` and help me with it.',
        )
        expect(sendMessage).not.toHaveBeenCalled()
        fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
        expect(await screen.findByRole('heading', { name: 'Workspace guide' })).toBeVisible()
      } finally {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth })
      }
    })

    it('does not give a session a path on a different computer', async () => {
      vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
      mockKnowledgeRoots([{
        ...knowledgeRoot, computerId: secondComputer.id, computerName: secondComputer.name,
      }])
      render(<App />)
      const composer = await screen.findByLabelText('Message')
      fireEvent.change(composer, { target: { value: 'Keep this draft' } })
      const ask = await openNote()
      expect(ask).toBeDisabled()
      expect(screen.getByText('Open a session on worker-node to ask about this file.')).toBeVisible()
      fireEvent.click(ask)
      expect(composer).toHaveValue('Keep this draft')
      expect(sendMessage).not.toHaveBeenCalled()
    })

    it('does not offer an agent handoff when the owning computer is offline', async () => {
      vi.mocked(listComputers).mockResolvedValue([{ ...computer, online: false }])
      render(<App />)
      const ask = await openNote()
      expect(ask).toBeDisabled()
      expect(screen.getByText('Reconnect development to ask about this file.')).toBeVisible()
      expect(sendMessage).not.toHaveBeenCalled()
    })

    it('opens Knowledge directly from the sessionless welcome screen', async () => {
      vi.mocked(listSessions).mockResolvedValue([])
      render(<App />)
      fireEvent.click(await screen.findByRole('button', { name: 'Open Knowledge' }))
      const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
      fireEvent.click(await within(tree).findByRole('treeitem', { name: /guide.md/ }))
      expect(await screen.findByRole('heading', { name: 'Workspace guide' })).toBeVisible()
      expect(screen.getByRole('button', { name: 'Ask agent about file' })).toBeDisabled()
      expect(createSession).not.toHaveBeenCalled()
    })

    it('refreshes and retries a folder without discarding the open document', async () => {
      render(<App />)
      await openNote()
      vi.mocked(listKnowledgeEntries).mockRejectedValueOnce(new Error('Folder temporarily unavailable'))
      fireEvent.click(screen.getByRole('button', { name: 'Refresh current folder' }))
      expect(await screen.findByRole('alert')).toHaveTextContent('Folder temporarily unavailable')
      expect(screen.getByRole('heading', { name: 'Workspace guide' })).toBeVisible()
      expect(screen.getByRole('treeitem', { name: 'guide.md' })).toBeVisible()
      fireEvent.click(screen.getByRole('button', { name: 'Retry loading root folder' }))
      await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
      expect(screen.getByRole('heading', { name: 'Workspace guide' })).toBeVisible()
      expect(sendMessage).not.toHaveBeenCalled()
    })

    it.each([
      { navigation: 'file', failure: false },
      { navigation: 'file', failure: true },
      { navigation: 'session', failure: false },
      { navigation: 'session', failure: true },
    ])(
      'releases only a stale refresh after $navigation navigation (failure=$failure)',
      async ({ navigation, failure }) => {
        vi.mocked(listSessions).mockResolvedValue([session, secondSession])
        vi.mocked(getSession).mockImplementation(async (_computer, id) =>
          id === secondSession.id ? secondSession : session,
        )
        localStorage.setItem('agentic-remote:knowledge-session-positions', JSON.stringify({
          'computer-1:session-2': { rootId: knowledgeRoot.id, path: '.', file: note.path },
        }))
        render(<App />)
        await openNote()
        const savedDraft = localStorage.getItem('agentic-remote:composer-drafts-v2')
        let resolve!: (listing: WorkspaceListing) => void
        let reject!: (error: Error) => void
        vi.mocked(listKnowledgeEntries).mockReturnValueOnce(new Promise((accept, refuse) => {
          resolve = accept
          reject = refuse
        }))
        const refresh = screen.getByRole('button', { name: 'Refresh current folder' })
        fireEvent.click(refresh)
        expect(refresh).toBeDisabled()
        if (navigation === 'file') {
          fireEvent.click(screen.getByRole('treeitem', { name: note.name }))
        } else {
          fireEvent.click(screen.getByRole('button', { name: /^Second chat,/ }))
        }
        await waitFor(() => expect(readKnowledgeFile).toHaveBeenCalledTimes(2))
        await act(async () => {
          if (failure) reject(new Error('Stale refresh failed'))
          else resolve({ path: '.', entries: [{ name: 'stale.md', path: 'stale.md', kind: 'markdown' }] })
        })
        const currentRefresh = screen.getByRole('button', { name: 'Refresh current folder' })
        await waitFor(() => expect(currentRefresh).toBeEnabled())
        expect(screen.getByRole('heading', { name: 'Workspace guide' })).toBeVisible()
        expect(screen.getByRole('treeitem', { name: note.name })).toBeVisible()
        expect(screen.queryByText('stale.md')).toBeNull()
        expect(screen.queryByText('Stale refresh failed')).toBeNull()
        expect(screen.queryByText('Refreshing folder...')).toBeNull()
        expect(localStorage.getItem('agentic-remote:composer-drafts-v2')).toBe(savedDraft)
        fireEvent.click(currentRefresh)
        await waitFor(() => expect(currentRefresh).toBeEnabled())
        expect(sendMessage).not.toHaveBeenCalled()
      },
    )

    it.each([
      { newerFirst: false, failure: false },
      { newerFirst: false, failure: true },
      { newerFirst: true, failure: false },
      { newerFirst: true, failure: true },
    ])(
      'preserves the newer refresh owner (newerFirst=$newerFirst, failure=$failure)',
      async ({ newerFirst, failure }) => {
        render(<App />)
        await openNote()
        let resolveOld!: (listing: WorkspaceListing) => void
        let rejectOld!: (error: Error) => void
        let resolveNew!: (listing: WorkspaceListing) => void
        vi.mocked(listKnowledgeEntries)
          .mockReturnValueOnce(new Promise((resolve, reject) => { resolveOld = resolve; rejectOld = reject }))
          .mockReturnValueOnce(new Promise((resolve) => { resolveNew = resolve }))
        const before = vi.mocked(listKnowledgeEntries).mock.calls.length
        const refresh = screen.getByRole('button', { name: 'Refresh current folder' })
        act(() => {
          fireEvent.click(refresh)
          fireEvent.click(refresh)
        })
        expect(vi.mocked(listKnowledgeEntries).mock.calls.length).toBe(before + 2)
        const fresh: WorkspaceListing = {
          path: '.', entries: [{ name: 'fresh.md', path: 'fresh.md', kind: 'markdown' }],
        }
        if (newerFirst) {
          await act(async () => resolveNew(fresh))
          expect(refresh).toBeEnabled()
        }
        await act(async () => {
          if (failure) rejectOld(new Error('Superseded refresh failed'))
          else resolveOld({ path: '.', entries: [{ name: 'stale.md', path: 'stale.md', kind: 'markdown' }] })
        })
        expect(screen.queryByText('stale.md')).toBeNull()
        expect(screen.queryByText('Superseded refresh failed')).toBeNull()
        if (!newerFirst) {
          expect(refresh).toBeDisabled()
          expect(screen.getByRole('treeitem', { name: note.name })).toBeVisible()
          await act(async () => resolveNew(fresh))
        }
        expect(refresh).toBeEnabled()
        expect(screen.getByRole('treeitem', { name: 'fresh.md' })).toBeVisible()
        expect(screen.getByRole('heading', { name: 'Workspace guide' })).toBeVisible()
        expect(screen.queryByText('Refreshing folder...')).toBeNull()
      },
    )

    it.each(['root', 'root-return', 'pairing'] as const)(
      'does not clear another %s lifetime loading the same folder path',
      async (change) => {
        const originalRoot = {
          ...knowledgeRoot, computerId: secondComputer.id, computerName: secondComputer.name,
        }
        const otherRoot = { ...knowledgeRoot, id: 'root-other', name: 'Other docs' }
        vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
        mockKnowledgeRoots([originalRoot, otherRoot])
        const listing: WorkspaceListing = {
          path: '.', entries: [{ name: note.name, path: note.path, kind: 'markdown' }],
        }
        render(<App />)
        await openNote()
        let resolveOld!: (listing: WorkspaceListing) => void
        let resolveNew!: (listing: WorkspaceListing) => void
        vi.mocked(listKnowledgeEntries).mockReturnValueOnce(new Promise((resolve) => { resolveOld = resolve }))
        fireEvent.click(screen.getByRole('button', { name: 'Refresh current folder' }))
        if (change === 'pairing') {
          act(() => {
            MockWebSocket.instances.at(-1)?.onmessage?.({
              data: JSON.stringify({ type: 'computer.removed', computerId: secondComputer.id }),
            } as MessageEvent)
          })
          await screen.findByText('Saved folder unavailable')
          await chooseKnowledgeRoot(otherRoot.id)
          await waitFor(() => expect(screen.getByRole('button', { name: 'Refresh current folder' })).toBeEnabled())
          act(() => {
            MockWebSocket.instances.at(-1)?.onmessage?.({
              data: JSON.stringify({ type: 'computer.updated', computer: secondComputer }),
            } as MessageEvent)
          })
        } else if (change === 'root-return') {
          await chooseKnowledgeRoot(otherRoot.id)
          await waitFor(() => expect(screen.getByRole('button', { name: 'Refresh current folder' })).toBeEnabled())
        }
        vi.mocked(listKnowledgeEntries).mockReturnValueOnce(new Promise((resolve) => { resolveNew = resolve }))
        if (change === 'pairing') {
          mockAddedKnowledgeRoot({ ...originalRoot, name: 'Repaired docs' })
          fireEvent.click(screen.getByRole('button', { name: 'New knowledge root' }))
          const dialog = await screen.findByRole('dialog', { name: 'Add knowledge root' })
          fireEvent.change(within(dialog).getByLabelText('Computer'), {
            target: { value: secondComputer.id },
          })
          const add = within(dialog).getByRole('button', { name: 'Add this folder' })
          await waitFor(() => expect(add).toBeEnabled())
          fireEvent.click(add)
          await screen.findAllByText('Repaired docs')
        } else {
          await chooseKnowledgeRoot(change === 'root' ? otherRoot.id : originalRoot.id)
        }
        await waitFor(() => expect(resolveNew).toBeDefined())
        const refresh = screen.getByRole('button', { name: 'Refresh current folder' })
        expect(refresh).toBeDisabled()
        await act(async () => resolveOld({
          path: '.', entries: [{ name: 'retired.md', path: 'retired.md', kind: 'markdown' }],
        }))
        expect(refresh).toBeDisabled()
        expect(screen.queryByText('retired.md')).toBeNull()
        await act(async () => resolveNew(listing))
        await waitFor(() => expect(refresh).toBeEnabled())
        expect(screen.getByRole('treeitem', { name: note.name })).toBeVisible()
        expect(screen.queryByText('retired.md')).toBeNull()
        expect(sendMessage).not.toHaveBeenCalled()
      },
    )

    it('retains the newest refresh error and retry when an older refresh succeeds late', async () => {
      render(<App />)
      await openNote()
      let resolveOld!: (listing: WorkspaceListing) => void
      let rejectNew!: (error: Error) => void
      vi.mocked(listKnowledgeEntries)
        .mockReturnValueOnce(new Promise((resolve) => { resolveOld = resolve }))
        .mockReturnValueOnce(new Promise((_resolve, reject) => { rejectNew = reject }))
      const refresh = screen.getByRole('button', { name: 'Refresh current folder' })
      act(() => {
        fireEvent.click(refresh)
        fireEvent.click(refresh)
      })
      await act(async () => rejectNew(new Error('Newest refresh failed')))
      await act(async () => resolveOld({
        path: '.', entries: [{ name: 'stale.md', path: 'stale.md', kind: 'markdown' }],
      }))
      expect(screen.getByRole('alert')).toHaveTextContent('Newest refresh failed')
      expect(screen.queryByText('stale.md')).toBeNull()
      const retry = screen.getByRole('button', { name: 'Retry loading root folder' })
      expect(retry).toBeEnabled()
      fireEvent.click(retry)
      await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
      await waitFor(() => expect(refresh).toBeEnabled())
      expect(screen.getByRole('treeitem', { name: note.name })).toBeVisible()
      expect(screen.getByRole('heading', { name: 'Workspace guide' })).toBeVisible()
    })
  })

  it('keeps custom ordering while explicit sorted views also drive keyboard navigation', async () => {
    const items = [
      { ...session, id: 'sort-zulu', title: 'Zulu' },
      { ...session, id: 'sort-mike', title: 'Mike', messages: [] },
      { ...session, id: 'sort-alpha', title: 'Alpha', messages: [] },
    ]
    const order = items.map((item) => `${computer.id}:${item.id}`)
    localStorage.setItem('agentic-remote:session-order', JSON.stringify({ [computer.id]: order }))
    vi.mocked(listSessions).mockResolvedValue(items)
    vi.mocked(getSession).mockImplementation(async (_computerId, id) => {
      const item = items.find((candidate) => candidate.id === id)
      if (!item) throw new Error(`Unexpected fixture session ${id}`)
      return item
    })
    render(<App />)
    await screen.findAllByText('Zulu')
    const titles = () => [...document.querySelectorAll('.session-item__open strong')]
      .map((element) => element.textContent)
    expect(titles()).toEqual(['Zulu', 'Mike', 'Alpha'])
    const draft = screen.getByLabelText('Message')
    fireEvent.change(draft, { target: { value: 'Keep this draft' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Session order' }), {
      target: { value: 'name' },
    })
    expect(titles()).toEqual(['Alpha', 'Mike', 'Zulu'])
    expect(draft).toHaveValue('Keep this draft')
    expect(savedSetting('sessionSort')).toBe('name')
    expect(JSON.parse(localStorage.getItem('agentic-remote:session-order') || '{}')[computer.id])
      .toEqual(order)
    fireEvent.keyDown(window, { key: 'ArrowDown', code: 'ArrowDown', altKey: true })
    await waitFor(() => expect(window.location.search).toContain('session=sort-alpha'))
    fireEvent.change(screen.getByRole('combobox', { name: 'Session order' }), {
      target: { value: 'custom' },
    })
    expect(titles()).toEqual(['Zulu', 'Mike', 'Alpha'])
  })

  it('keeps session shortcuts inside the visible search and attention results', async () => {
    const items = [
      { ...session, id: 'visible-first', title: 'Visible first', messages: [] },
      { ...session, id: 'hidden-session', title: 'Hidden conversation', messages: [] },
      {
        ...session, id: 'visible-last', title: 'Visible last', messages: [],
        status: 'error' as const,
      },
    ]
    localStorage.setItem('agentic-remote:session-order', JSON.stringify({
      [computer.id]: items.map((item) => `${computer.id}:${item.id}`),
    }))
    vi.mocked(listSessions).mockResolvedValue(items)
    vi.mocked(getSession).mockImplementation(async (_computerId, id) => {
      const item = items.find((candidate) => candidate.id === id)
      if (!item) throw new Error(`Unexpected fixture session ${id}`)
      return item
    })
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: /^Hidden conversation,/ }))
    await waitFor(() => expect(window.location.search).toContain('session=hidden-session'))
    const search = screen.getByRole('searchbox', { name: 'Search sessions' })
    fireEvent.change(search, { target: { value: 'Visible' } })
    fireEvent.keyDown(window, { key: 'ArrowDown', code: 'ArrowDown', altKey: true })
    await waitFor(() => expect(window.location.search).toContain('session=visible-first'))
    fireEvent.keyDown(window, { key: 'ArrowDown', code: 'ArrowDown', altKey: true })
    await waitFor(() => expect(window.location.search).toContain('session=visible-last'))
    fireEvent.keyDown(window, { key: 'ArrowUp', code: 'ArrowUp', altKey: true })
    await waitFor(() => expect(window.location.search).toContain('session=visible-first'))
    fireEvent.change(search, { target: { value: 'Missing' } })
    fireEvent.keyDown(window, { key: 'ArrowDown', code: 'ArrowDown', altKey: true })
    expect(window.location.search).toContain('session=visible-first')
    fireEvent.change(search, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Needs you' }))
    fireEvent.keyDown(window, { key: 'ArrowUp', code: 'ArrowUp', altKey: true })
    await waitFor(() => expect(window.location.search).toContain('session=visible-last'))
  })

  it('reports a refused sort preference and returns to the saved one', async () => {
    render(<App />)
    await screen.findByLabelText('Message')
    await waitFor(() => expect(fetchSettingsProfile).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Open sessions' }))
    vi.mocked(saveSettingsChanges).mockRejectedValueOnce(
      Object.assign(new Error('Setting sessionSort is not a known sort'), { statusCode: 400 }),
    )
    fireEvent.change(screen.getByRole('combobox', { name: 'Session order' }), {
      target: { value: 'recent' },
    })
    expect(await screen.findByText(
      'Session sort wasn’t saved: Setting sessionSort is not a known sort',
    )).toBeVisible()
    expect(screen.getByRole('combobox', { name: 'Session order' })).toHaveValue('custom')
    expect(hubSettings.values.sessionSort).toBeUndefined()
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss settings notice' }))
    expect(screen.queryByText(/wasn’t saved/)).toBeNull()
  })

  it('does not report automatic order reconciliation as a failed user reorder', async () => {
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    const original = Storage.prototype.setItem
    const save = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage, key: string, value: string,
    ) {
      if (
        key === 'agentic-remote:computer-order' ||
        key === 'agentic-remote:session-order'
      ) {
        throw new DOMException('Storage access denied', 'SecurityError')
      }
      original.call(this, key, value)
    })
    try {
      render(<App />)
      await screen.findByLabelText('Message')
      expect(screen.queryByText(/Could not save the (computer|session) order/))
        .not.toBeInTheDocument()
    } finally {
      save.mockRestore()
    }
  })

  it('hydrates the custom order from the hub instead of this browser', async () => {
    const items = [
      { ...session, id: 'hub-a', title: 'Alpha' },
      { ...session, id: 'hub-b', title: 'Bravo', messages: [] },
    ]
    vi.mocked(listSessions).mockResolvedValue(items)
    vi.mocked(getSession).mockImplementation(async (_computerId, id) =>
      items.find((candidate) => candidate.id === id) ?? items[0],
    )
    // A stale local arrangement must lose to an order the hub already holds.
    localStorage.setItem(
      'agentic-remote:session-order',
      JSON.stringify({ [computer.id]: [`${computer.id}:hub-a`, `${computer.id}:hub-b`] }),
    )
    hubSessionOrder = {
      revision: 9,
      bootstrapped: true,
      showSuspended: true,
      order: { [computer.id]: [`${computer.id}:hub-b`, `${computer.id}:hub-a`] },
    }

    render(<App />)
    await screen.findAllByText('Alpha')
    const titles = () => [...document.querySelectorAll('.session-item__open strong')]
      .map((element) => element.textContent)
    await waitFor(() => expect(titles()).toEqual(['Bravo', 'Alpha']))
    expect(bootstrapSessionOrder).not.toHaveBeenCalled()
  })

  it('seeds an empty hub from the browser order exactly once', async () => {
    const items = [
      { ...session, id: 'seed-a', title: 'Alpha' },
      { ...session, id: 'seed-b', title: 'Bravo', messages: [] },
    ]
    vi.mocked(listSessions).mockResolvedValue(items)
    vi.mocked(getSession).mockImplementation(async (_computerId, id) =>
      items.find((candidate) => candidate.id === id) ?? items[0],
    )
    const legacy = { [computer.id]: [`${computer.id}:seed-b`, `${computer.id}:seed-a`] }
    localStorage.setItem('agentic-remote:session-order', JSON.stringify(legacy))

    render(<App />)
    await screen.findAllByText('Alpha')
    await waitFor(() => expect(bootstrapSessionOrder).toHaveBeenCalledWith(legacy))
    const titles = () => [...document.querySelectorAll('.session-item__open strong')]
      .map((element) => element.textContent)
    await waitFor(() => expect(titles()).toEqual(['Bravo', 'Alpha']))
  })

  it('persists suspended visibility and accepts newer changes from another device', async () => {
    const paused = {
      ...session,
      id: 'shared-paused',
      title: 'Paused planning',
      suspended: true,
      messages: [],
    }
    const items = [session, paused]
    vi.mocked(listSessions).mockResolvedValue(items)
    vi.mocked(getSession).mockImplementation(async (_computerId, id) =>
      items.find((candidate) => candidate.id === id) ?? items[0],
    )
    hubSessionOrder = {
      revision: 3,
      bootstrapped: true,
      showSuspended: false,
      order: {
        [computer.id]: items.map((item) => `${computer.id}:${item.id}`),
      },
    }

    render(<App />)
    await screen.findByLabelText('Message')
    fireEvent.click(screen.getByRole('button', { name: 'Open sessions' }))
    const toggle = await screen.findByRole('button', {
      name: 'Include suspended sessions',
    })
    await waitFor(() => expect(toggle).toHaveAttribute('aria-pressed', 'false'))
    expect(screen.queryByRole('button', { name: /^Paused planning,/ })).toBeNull()

    hubSessionOrder = { ...hubSessionOrder, revision: 4, showSuspended: true }
    act(() => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({
          type: 'session.order.updated',
          order: hubSessionOrder,
        }),
      } as MessageEvent)
    })
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /^Paused planning,/ })).toBeVisible()

    act(() => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({
          type: 'session.order.updated',
          order: { ...hubSessionOrder, revision: 3, showSuspended: false },
        }),
      } as MessageEvent)
    })
    expect(toggle).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(toggle)
    await waitFor(() => expect(saveSessionVisibility).toHaveBeenCalledWith(false))
    await waitFor(() => expect(toggle).toHaveAttribute('aria-pressed', 'false'))
    expect(screen.queryByRole('button', { name: /^Paused planning,/ })).toBeNull()
  })

  it('reorders active sessions with their trailing hidden suspended blocks', async () => {
    const alpha = { ...session, id: 'block-alpha', title: 'Alpha' }
    const alphaPaused = {
      ...session,
      id: 'block-alpha-paused',
      title: 'Alpha paused',
      suspended: true,
      messages: [],
    }
    const bravo = {
      ...session,
      id: 'block-bravo',
      title: 'Bravo',
      messages: [],
    }
    const bravoPaused = {
      ...session,
      id: 'block-bravo-paused',
      title: 'Bravo paused',
      suspended: true,
      messages: [],
    }
    const charlie = {
      ...session,
      id: 'block-charlie',
      title: 'Charlie',
      messages: [],
    }
    const items = [alpha, alphaPaused, bravo, bravoPaused, charlie]
    const keys = items.map((item) => `${computer.id}:${item.id}`)
    vi.mocked(listSessions).mockResolvedValue(items)
    vi.mocked(getSession).mockImplementation(async (_computerId, id) =>
      items.find((candidate) => candidate.id === id) ?? alpha,
    )
    hubSessionOrder = {
      revision: 5,
      bootstrapped: true,
      showSuspended: false,
      order: { [computer.id]: keys },
    }

    render(<App />)
    await screen.findByLabelText('Message')
    fireEvent.click(screen.getByRole('button', { name: 'Open sessions' }))
    await waitFor(() =>
      expect(screen.getByRole('button', {
        name: 'Include suspended sessions',
      })).toHaveAttribute('aria-pressed', 'false'),
    )
    expect(screen.queryByRole('button', { name: /^Alpha paused,/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /^Bravo paused,/ })).toBeNull()
    expect(screen.getByLabelText('Reorder Alpha')).not
      .toHaveAttribute('aria-disabled', 'true')

    act(() => {
      finishReorder(
        'session-navigation',
        `session:${keys[0]}`,
        `session:${keys[2]}`,
      )
    })

    const expected = [keys[2], keys[3], keys[0], keys[1], keys[4]]
    await waitFor(() =>
      expect(saveSessionOrderLane).toHaveBeenCalledWith(computer.id, expected),
    )
    await waitFor(() =>
      expect(
        [...document.querySelectorAll('.session-item__open strong')]
          .map((element) => element.textContent),
      ).toEqual(['Bravo', 'Alpha', 'Charlie']),
    )
  })

  it('keeps the committed visibility when saving it fails', async () => {
    const paused = {
      ...session,
      id: 'failed-paused',
      title: 'Paused planning',
      suspended: true,
      messages: [],
    }
    vi.mocked(listSessions).mockResolvedValue([session, paused])
    vi.mocked(saveSessionVisibility).mockRejectedValueOnce(new Error('Hub unavailable'))

    render(<App />)
    await screen.findByLabelText('Message')
    fireEvent.click(screen.getByRole('button', { name: 'Open sessions' }))
    const toggle = await screen.findByRole('button', {
      name: 'Include suspended sessions',
    })
    fireEvent.click(toggle)

    expect(await screen.findAllByText(
      'Could not save suspended-session visibility: Hub unavailable',
    )).not.toHaveLength(0)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /^Paused planning,/ })).toBeVisible()
  })

  it('does not let Clear filters race an in-flight visibility save', async () => {
    const paused = {
      ...session,
      id: 'pending-paused',
      title: 'Paused planning',
      suspended: true,
      messages: [],
    }
    vi.mocked(listSessions).mockResolvedValue([session, paused])
    let finish!: (snapshot: typeof hubSessionOrder) => void
    vi.mocked(saveSessionVisibility).mockImplementationOnce(() =>
      new Promise((resolve) => {
        finish = resolve
      }),
    )

    render(<App />)
    await screen.findByLabelText('Message')
    fireEvent.click(screen.getByRole('button', { name: 'Open sessions' }))
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search sessions' }), {
      target: { value: 'Project' },
    })
    const toggle = screen.getByRole('button', {
      name: 'Include suspended sessions',
    })
    fireEvent.click(toggle)

    const clear = screen.getByRole('button', { name: 'Clear filters' })
    expect(clear).toBeDisabled()
    fireEvent.click(clear)
    expect(screen.getByRole('searchbox', { name: 'Search sessions' }))
      .toHaveValue('Project')

    const hidden = {
      ...hubSessionOrder,
      revision: hubSessionOrder.revision + 1,
      showSuspended: false,
    }
    finish(hidden)
    await waitFor(() => expect(clear).toBeEnabled())
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(clear)
    await waitFor(() => expect(saveSessionVisibility).toHaveBeenLastCalledWith(true))
    await waitFor(() => expect(toggle).toHaveAttribute('aria-pressed', 'true'))
    expect(screen.getByRole('searchbox', { name: 'Search sessions' })).toHaveValue('')
  })

  it('renders a reorder committed by another client, and ignores a stale one', async () => {
    const items = [
      { ...session, id: 'live-a', title: 'Alpha' },
      { ...session, id: 'live-b', title: 'Bravo', messages: [] },
    ]
    vi.mocked(listSessions).mockResolvedValue(items)
    vi.mocked(getSession).mockImplementation(async (_computerId, id) =>
      items.find((candidate) => candidate.id === id) ?? items[0],
    )
    hubSessionOrder = {
      revision: 4,
      bootstrapped: true,
      showSuspended: true,
      order: { [computer.id]: [`${computer.id}:live-a`, `${computer.id}:live-b`] },
    }
    render(<App />)
    await screen.findAllByText('Alpha')
    const titles = () => [...document.querySelectorAll('.session-item__open strong')]
      .map((element) => element.textContent)
    await waitFor(() => expect(titles()).toEqual(['Alpha', 'Bravo']))

    act(() => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({
          type: 'session.order.updated',
          order: {
            revision: 5,
            bootstrapped: true,
            showSuspended: true,
            order: { [computer.id]: [`${computer.id}:live-b`, `${computer.id}:live-a`] },
          },
        }),
      } as MessageEvent)
    })
    expect(titles()).toEqual(['Bravo', 'Alpha'])

    // A late delivery of an older revision is not a correction.
    act(() => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({
          type: 'session.order.updated',
          order: {
            revision: 4,
            bootstrapped: true,
            showSuspended: true,
            order: { [computer.id]: [`${computer.id}:live-a`, `${computer.id}:live-b`] },
          },
        }),
      } as MessageEvent)
    })
    expect(titles()).toEqual(['Bravo', 'Alpha'])
  })

  it('sends only the dragged computer lane to the hub', async () => {
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    render(<App />)
    await screen.findByLabelText('Message')
    fireEvent.click(screen.getByRole('button', { name: 'Open sessions' }))

    await act(async () => {
      finishReorder(
        'session-navigation',
        `session:${computer.id}:${session.id}`,
        `session:${computer.id}:${session.id}`,
      )
    })
    // Dropping a session on itself is not a reorder.
    expect(saveSessionOrderLane).not.toHaveBeenCalled()
  })

  it('refetches the order after a socket outage', async () => {
    const items = [
      { ...session, id: 'gap-a', title: 'Alpha' },
      { ...session, id: 'gap-b', title: 'Bravo', messages: [] },
    ]
    vi.mocked(listSessions).mockResolvedValue(items)
    vi.mocked(getSession).mockImplementation(async (_computerId, id) =>
      items.find((candidate) => candidate.id === id) ?? items[0],
    )
    hubSessionOrder = {
      revision: 2,
      bootstrapped: true,
      showSuspended: true,
      order: { [computer.id]: [`${computer.id}:gap-a`, `${computer.id}:gap-b`] },
    }
    render(<App />)
    await screen.findAllByText('Alpha')
    const titles = () => [...document.querySelectorAll('.session-item__open strong')]
      .map((element) => element.textContent)
    await waitFor(() => expect(titles()).toEqual(['Alpha', 'Bravo']))

    // Committed while this browser had no socket. Order events are not
    // replayed, so only a refetch can reveal it.
    hubSessionOrder = {
      revision: 3,
      bootstrapped: true,
      showSuspended: true,
      order: { [computer.id]: [`${computer.id}:gap-b`, `${computer.id}:gap-a`] },
    }
    await act(async () => {
      MockWebSocket.instances.at(-1)?.onopen?.()
    })
    await waitFor(() => expect(titles()).toEqual(['Bravo', 'Alpha']))
  })

  it('keeps a newer acknowledged order when an older save is refused', async () => {
    const items = [
      { ...session, id: 'race-a', title: 'Alpha' },
      { ...session, id: 'race-b', title: 'Bravo', messages: [] },
      { ...session, id: 'race-c', title: 'Charlie', messages: [] },
    ]
    vi.mocked(listSessions).mockResolvedValue(items)
    vi.mocked(getSession).mockImplementation(async (_computerId, id) =>
      items.find((candidate) => candidate.id === id) ?? items[0],
    )
    const key = (id: string) => `${computer.id}:${id}`
    hubSessionOrder = {
      revision: 2,
      bootstrapped: true,
      showSuspended: true,
      order: { [computer.id]: [key('race-a'), key('race-b'), key('race-c')] },
    }
    render(<App />)
    await screen.findAllByText('Alpha')
    const titles = () => [...document.querySelectorAll('.session-item__open strong')]
      .map((element) => element.textContent)
    await waitFor(() => expect(titles()).toEqual(['Alpha', 'Bravo', 'Charlie']))

    // While this drag is in flight another client commits a different order.
    vi.mocked(saveSessionOrderLane).mockImplementationOnce(async () => {
      act(() => {
        MockWebSocket.instances.at(-1)?.onmessage?.({
          data: JSON.stringify({
            type: 'session.order.updated',
            order: {
              revision: 50,
              bootstrapped: true,
              showSuspended: true,
              order: { [computer.id]: [key('race-c'), key('race-b'), key('race-a')] },
            },
          }),
        } as MessageEvent)
      })
      throw new Error('Hub unavailable')
    })

    await act(async () => {
      finishReorder(
        'session-navigation',
        `session:${computer.id}:race-a`,
        `session:${computer.id}:race-b`,
      )
    })

    expect(within(screen.getByRole('main'))
      .getByText('Could not save the session order: Hub unavailable')).toBeVisible()
    // Withdrawing only this attempt: the newer revision stands, rather than
    // the order captured before the drag began.
    expect(titles()).toEqual(['Charlie', 'Bravo', 'Alpha'])
  })

  it('reports a refused custom computer order without losing the draft', async () => {
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    render(<App />)
    fireEvent.change(await screen.findByLabelText('Message'), { target: { value: 'Keep my draft' } })
    await waitFor(() => expect(fetchSettingsProfile).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Open sessions' }))
    const computers = () => [...document.querySelectorAll('.computer-session-groups > *')]
      .map((element) => element.textContent?.includes(secondComputer.name) ? 'second' : 'first')
    const before = computers()
    vi.mocked(saveSettingsChanges).mockRejectedValueOnce(
      Object.assign(new Error('Setting computerOrder lists pc twice'), { statusCode: 400 }),
    )
    await act(async () => finishReorder(
      'session-navigation',
      `computer:${computer.id}`,
      `computer:${secondComputer.id}`,
    ))
    expect(await screen.findByText(
      'Computer order wasn’t saved: Setting computerOrder lists pc twice',
    )).toBeVisible()
    expect(computers()).toEqual(before)
    expect(screen.getByLabelText('Message')).toHaveValue('Keep my draft')
    expect(hubSettings.values.computerOrder).toBeUndefined()
  })

  it('restores the acknowledged session order when the hub refuses the write', async () => {
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    render(<App />)
    fireEvent.change(await screen.findByLabelText('Message'), { target: { value: 'Keep my draft' } })
    fireEvent.click(screen.getByRole('button', { name: 'Open sessions' }))
    const titles = () => [...document.querySelectorAll('.session-item__open strong')]
      .map((element) => element.textContent)
    const before = titles()
    vi.mocked(saveSessionOrderLane).mockRejectedValueOnce(new Error('Hub unavailable'))

    await act(async () => {
      finishReorder(
        'session-navigation',
        `session:${computer.id}:${session.id}`,
        `session:${computer.id}:${secondSession.id}`,
      )
    })

    expect(within(screen.getByRole('main'))
      .getByText('Could not save the session order: Hub unavailable')).toBeVisible()
    expect(document.querySelector('.sidebar')).not.toHaveClass('sidebar--open')
    expect(screen.getByLabelText('Message')).toHaveValue('Keep my draft')
    // The list must not keep a position no other device will agree with.
    expect(titles()).toEqual(before)
  })

  it('keeps search arrows from recalling a prompt or changing the selected session', async () => {
    render(<App />)
    const composer = await screen.findByLabelText('Message')
    fireEvent.change(composer, { target: { value: 'Keep my draft' } })
    const search = screen.getByRole('searchbox', { name: 'Search sessions' })
    search.focus()
    fireEvent.change(search, { target: { value: 'Project' } })
    fireEvent.keyDown(search, { key: 'ArrowUp' })
    expect(composer).toHaveValue('Keep my draft')
    expect(search).toHaveFocus()
    expect(window.location.search).toBe('?computer=computer-1&session=session-1')
  })

  it('dismisses session actions before the open Knowledge panel on Escape', async () => {
    mockKnowledgeRoots([knowledgeRoot])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({ path: '.', entries: [] })
    render(<App />)
    await screen.findByLabelText('Message')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const action = sessionAction('Rename session')
    action.focus()
    fireEvent.keyDown(action, { key: 'Escape' })
    expect(screen.queryByRole('group', { name: 'Session actions' })).toBeNull()
    expect(document.querySelector('.workspace')).toHaveClass('workspace--docked')
    expect(screen.getByRole('button', { name: 'Session actions' })).toHaveFocus()
  })

  it('keeps offline lifecycle actions unavailable while allowing hub-owned notification settings', async () => {
    vi.mocked(listSessions).mockResolvedValue([{ ...session, executionMode: 'sdk' }])
    vi.mocked(getSession).mockResolvedValue({ ...session, executionMode: 'sdk' })
    render(<App />)
    await screen.findByLabelText('Message')
    act(() => {
      MockWebSocket.instances.at(-1)?.onmessage?.({
        data: JSON.stringify({ type: 'computer.updated', computer: { ...computer, online: false } }),
      } as MessageEvent)
    })
    openSessionActions()
    for (const name of ['Rename session', 'Restart session', 'Clear conversation', 'Close session', 'Move session to tmux']) {
      expect(screen.getByRole('button', { name })).toBeDisabled()
    }
    expect(screen.getByRole('button', { name: 'Mute session notifications' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Close session' })).toHaveAccessibleDescription(
      'Permanently deletes this session and history',
    )
    expect(deleteSession).not.toHaveBeenCalled()
    expect(clearConversation).not.toHaveBeenCalled()
    expect(restartSession).not.toHaveBeenCalled()
    expect(moveSessionToTmux).not.toHaveBeenCalled()
  })

  it('does not let a stale idle status authorize restart, clear, migration or suspend over a pending question', async () => {
    const pending = {
      ...session,
      executionMode: 'sdk' as const,
      pendingUserInput: { requestId: 'question', question: 'Keep this pending', choices: [], allowFreeform: true },
    }
    vi.mocked(listSessions).mockResolvedValue([pending])
    vi.mocked(getSession).mockResolvedValue(pending)
    render(<App />)
    await screen.findByRole('heading', { name: 'Keep this pending' })
    openSessionActions()
    for (const name of ['Restart session', 'Clear conversation', 'Move session to tmux', 'Suspend Project chat']) {
      expect(screen.getByRole('button', { name })).toBeDisabled()
    }
    expect(screen.getByRole('button', { name: 'Close session' })).toBeEnabled()
    expect(replyUserInput).not.toHaveBeenCalled()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('moves the session to a folder browsed in Knowledge', async () => {
    vi.mocked(executeCommand).mockImplementation(
      async (_computerId, _sessionId, input) => ({
        ...session,
        cwd: input.command.slice('/cwd '.length),
      }),
    )
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([])
    vi.mocked(listDirectories).mockImplementation(
      async (_computerId, path = '~') => ({
        path,
        parent: path === '~' ? undefined : '~',
        directories: [],
      }),
    )
    mockAddedKnowledgeRoot({
      id: 'root-new',
      computerId: computer.id,
      computerName: computer.name,
      path: session.cwd,
      name: 'project',
      createdAt: '2026-08-01T00:00:00.000Z',
    })
    vi.mocked(listKnowledgeEntries).mockResolvedValue({
      path: '.',
      entries: [],
    })
    render(<App />)
    await screen.findAllByText('Project chat')

    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    // Sessions stay visible beside the panel, so the folder has to be picked
    // inside the dialog rather than anywhere on screen.
    const rootDialog = await screen.findByRole('dialog', {
      name: 'Add knowledge root',
    })
    await waitFor(() =>
      expect(listDirectories).toHaveBeenCalledWith(
        computer.id,
        session.cwd,
        'all',
      ),
    )
    const addFolder = within(rootDialog).getByRole('button', {
      name: 'Add this folder',
    })
    await waitFor(() => expect(addFolder).toBeEnabled())
    fireEvent.click(addFolder)

    await waitFor(() =>
      expect(addKnowledgeRoot).toHaveBeenCalledWith({
        computerId: computer.id,
        path: session.cwd,
      }),
    )
  })

  it('falls back to home when the active session folder is unavailable', async () => {
    mockKnowledgeRoots([])
    vi.mocked(listDirectories).mockImplementation(
      async (_computerId, path = '~') => {
        if (path === session.cwd) {
          throw new Error('Folder does not exist')
        }
        return {
          path: '~',
          directories: [{ name: 'src', path: '~/src' }],
        }
      },
    )

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const rootDialog = await screen.findByRole('dialog', {
      name: 'Add knowledge root',
    })

    await waitFor(() =>
      expect(listDirectories).toHaveBeenNthCalledWith(
        2,
        computer.id,
        '~',
        'all',
      ),
    )
    expect(
      within(rootDialog).getByText(
        `Could not open ${session.cwd}: Folder does not exist. Showing the home folder instead.`,
      ),
    ).toBeInTheDocument()
    expect(
      within(rootDialog).getByRole('button', { name: 'Add this folder' }),
    ).toBeEnabled()
  })

  it('uses the session folder only before the root picker computer changes', async () => {
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    mockKnowledgeRoots([])
    vi.mocked(listDirectories).mockImplementation(
      async (_computerId, path = '~') => ({ path, directories: [] }),
    )

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const rootDialog = await screen.findByRole('dialog', {
      name: 'Add knowledge root',
    })
    const computerSelect = within(rootDialog).getByLabelText('Computer')
    await waitFor(() =>
      expect(listDirectories).toHaveBeenCalledWith(
        computer.id,
        session.cwd,
        'all',
      ),
    )

    fireEvent.change(computerSelect, {
      target: { value: secondComputer.id },
    })
    await waitFor(() =>
      expect(listDirectories).toHaveBeenCalledWith(
        secondComputer.id,
        '~',
        'all',
      ),
    )
    fireEvent.change(computerSelect, { target: { value: computer.id } })
    await waitFor(() =>
      expect(listDirectories).toHaveBeenLastCalledWith(
        computer.id,
        '~',
        'all',
      ),
    )
  })

  it('ignores a stale root browse after switching computers', async () => {
    let finishStaleBrowse:
      | ((listing: {
          path: string
          parent: string
          directories: []
        }) => void)
      | undefined
    vi.mocked(listComputers).mockResolvedValue([computer, secondComputer])
    mockKnowledgeRoots([])
    vi.mocked(listDirectories).mockImplementation(
      async (computerId, path = '~') => {
        if (computerId === computer.id && path === session.cwd) {
          return {
            path,
            directories: [{ name: 'slow', path: `${path}/slow` }],
          }
        }
        if (computerId === computer.id && path.endsWith('/slow')) {
          return await new Promise((resolve) => {
            finishStaleBrowse = resolve
          })
        }
        return { path: '/home/worker', directories: [] }
      },
    )

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const rootDialog = await screen.findByRole('dialog', {
      name: 'Add knowledge root',
    })
    fireEvent.click(
      await within(rootDialog).findByRole('button', { name: 'slow' }),
    )
    fireEvent.change(within(rootDialog).getByLabelText('Computer'), {
      target: { value: secondComputer.id },
    })
    await within(rootDialog).findByText('/home/worker')

    await act(async () => {
      finishStaleBrowse?.({
        path: `${session.cwd}/slow`,
        parent: session.cwd,
        directories: [],
      })
    })
    expect(within(rootDialog).getByText('/home/worker')).toBeInTheDocument()
    expect(
      within(rootDialog).queryByText(`${session.cwd}/slow`),
    ).not.toBeInTheDocument()
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
    mockKnowledgeRoots([
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

  it('reloads the active Knowledge document on reopen, expand, and minimize', async () => {
    mockKnowledgeRoots([knowledgeRoot])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({
      path: '.',
      entries: [{
        name: 'guide.md',
        path: 'guide.md',
        kind: 'markdown',
        size: 20,
      }],
    })
    let revision = 0
    vi.mocked(readKnowledgeFile).mockImplementation(async () => {
      revision += 1
      return {
        name: 'guide.md',
        path: 'guide.md',
        kind: 'markdown',
        mimeType: 'text/markdown',
        size: 20,
        content: `# Revision ${revision}`,
      }
    })

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    fireEvent.click(await within(tree).findByRole('treeitem', { name: /guide.md/ }))
    await screen.findByRole('heading', { name: 'Revision 1' })
    const content = document.querySelector<HTMLElement>(
      '.knowledge-reader .workspace-preview__content',
    )
    expect(content).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Source' }))
    expect(screen.getByRole('button', { name: 'Source' }))
      .toHaveAttribute('aria-pressed', 'true')
    await act(async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    })
    if (content) {
      content.scrollTop = 120
      fireEvent.scroll(content)
    }

    fireEvent.click(screen.getByRole('button', { name: 'Expand knowledge panel' }))
    await waitFor(() => expect(content).toHaveTextContent('# Revision 2'))
    expect(content?.scrollTop).toBe(120)
    fireEvent.click(screen.getByRole('button', { name: 'Minimize knowledge panel' }))
    await waitFor(() => expect(content).toHaveTextContent('# Revision 3'))
    expect(content?.scrollTop).toBe(120)
    fireEvent.click(screen.getByRole('button', { name: 'Close knowledge panel' }))
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    await waitFor(() => expect(content).toHaveTextContent('# Revision 4'))

    expect(readKnowledgeFile).toHaveBeenCalledTimes(4)
    expect(screen.getByRole('button', { name: 'Source' }))
      .toHaveAttribute('aria-pressed', 'true')
    expect(
      document.querySelector<HTMLElement>(
        '.knowledge-reader .workspace-preview__content',
      )?.scrollTop,
    ).toBe(120)
  })

  it('does not let a slow Knowledge mode refresh replace a newer document', async () => {
    mockKnowledgeRoots([knowledgeRoot])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({
      path: '.',
      entries: [
        { name: 'guide.md', path: 'guide.md', kind: 'markdown', size: 20 },
        { name: 'other.md', path: 'other.md', kind: 'markdown', size: 20 },
      ],
    })
    let finishRefresh:
      | ((file: WorkspaceFile) => void)
      | undefined
    let guideReads = 0
    vi.mocked(readKnowledgeFile).mockImplementation(async (_rootId, path) => {
      if (path === 'other.md') {
        return {
          name: 'other.md',
          path: 'other.md',
          kind: 'markdown',
          mimeType: 'text/markdown',
          size: 20,
          content: '# Newer document',
        }
      }
      guideReads += 1
      if (guideReads === 1) {
        return {
          name: 'guide.md',
          path: 'guide.md',
          kind: 'markdown',
          mimeType: 'text/markdown',
          size: 20,
          content: '# Original document',
        }
      }
      return new Promise<WorkspaceFile>((resolve) => {
        finishRefresh = resolve
      })
    })

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    fireEvent.click(await within(tree).findByRole('treeitem', { name: /guide.md/ }))
    await screen.findByRole('heading', { name: 'Original document' })

    fireEvent.click(screen.getByRole('button', { name: 'Expand knowledge panel' }))
    await waitFor(() => expect(guideReads).toBe(2))
    fireEvent.click(within(tree).getByRole('treeitem', { name: /other.md/ }))
    await screen.findByRole('heading', { name: 'Newer document' })

    await act(async () => {
      finishRefresh?.({
        name: 'guide.md',
        path: 'guide.md',
        kind: 'markdown',
        mimeType: 'text/markdown',
        size: 20,
        content: '# Stale refresh',
      })
    })
    expect(
      screen.getByRole('heading', { name: 'Newer document' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Stale refresh' }),
    ).not.toBeInTheDocument()
  })

  it('does not let a mode change cancel file navigation already in flight', async () => {
    mockKnowledgeRoots([knowledgeRoot])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({
      path: '.',
      entries: [
        { name: 'guide.md', path: 'guide.md', kind: 'markdown', size: 20 },
        { name: 'other.md', path: 'other.md', kind: 'markdown', size: 20 },
      ],
    })
    let finishNavigation:
      | ((file: WorkspaceFile) => void)
      | undefined
    vi.mocked(readKnowledgeFile).mockImplementation(async (_rootId, path) => {
      if (path === 'other.md') {
        return new Promise<WorkspaceFile>((resolve) => {
          finishNavigation = resolve
        })
      }
      return {
        name: 'guide.md',
        path: 'guide.md',
        kind: 'markdown',
        mimeType: 'text/markdown',
        size: 20,
        content: '# Original document',
      }
    })

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    fireEvent.click(await within(tree).findByRole('treeitem', { name: /guide.md/ }))
    await screen.findByRole('heading', { name: 'Original document' })

    fireEvent.click(within(tree).getByRole('treeitem', { name: /other.md/ }))
    await waitFor(() => expect(finishNavigation).toBeDefined())
    fireEvent.click(screen.getByRole('button', { name: 'Expand knowledge panel' }))
    expect(readKnowledgeFile).toHaveBeenCalledTimes(2)

    await act(async () => {
      finishNavigation?.({
        name: 'other.md',
        path: 'other.md',
        kind: 'markdown',
        mimeType: 'text/markdown',
        size: 20,
        content: '# Navigated document',
      })
    })
    expect(
      await screen.findByRole('heading', { name: 'Navigated document' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Ask agent about file' }),
    ).toBeEnabled()
  })

  it('settles reopen ownership when the panel mode changes during refresh', async () => {
    mockKnowledgeRoots([knowledgeRoot])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({
      path: '.',
      entries: [{
        name: 'guide.md',
        path: 'guide.md',
        kind: 'markdown',
        size: 20,
      }],
    })
    let revision = 0
    let finishReopen:
      | ((file: WorkspaceFile) => void)
      | undefined
    vi.mocked(readKnowledgeFile).mockImplementation(async () => {
      revision += 1
      const file: WorkspaceFile = {
        name: 'guide.md',
        path: 'guide.md',
        kind: 'markdown',
        mimeType: 'text/markdown',
        size: 20,
        content: `# Revision ${revision}`,
      }
      if (revision === 2) {
        return new Promise<WorkspaceFile>((resolve) => {
          finishReopen = resolve
        })
      }
      return file
    })

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    fireEvent.click(await within(tree).findByRole('treeitem', { name: /guide.md/ }))
    await screen.findByRole('heading', { name: 'Revision 1' })
    tree.scrollTop = 70
    fireEvent.scroll(tree)

    fireEvent.click(screen.getByRole('button', { name: 'Close knowledge panel' }))
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    await waitFor(() => expect(finishReopen).toBeDefined())
    fireEvent.click(screen.getByRole('button', { name: 'Expand knowledge panel' }))
    expect(readKnowledgeFile).toHaveBeenCalledTimes(2)
    await act(async () => {
      finishReopen?.({
        name: 'guide.md',
        path: 'guide.md',
        kind: 'markdown',
        mimeType: 'text/markdown',
        size: 20,
        content: '# Revision 2',
      })
    })
    await screen.findByRole('heading', { name: 'Revision 2' })

    fireEvent.click(screen.getByRole('button', { name: 'Minimize knowledge panel' }))
    await screen.findByRole('heading', { name: 'Revision 3' })
    tree.scrollTop = 95
    fireEvent.scroll(tree)
    fireEvent.click(screen.getByRole('button', { name: 'Close knowledge panel' }))
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    await screen.findByRole('heading', { name: 'Revision 4' })
    await act(async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    })
    expect(tree.scrollTop).toBe(95)
  })

  it('reloads an active sessionless Knowledge document on reopen', async () => {
    vi.mocked(listSessions).mockResolvedValue([])
    mockKnowledgeRoots([knowledgeRoot])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({
      path: '.',
      entries: [{
        name: 'guide.md',
        path: 'guide.md',
        kind: 'markdown',
        size: 20,
      }],
    })
    let revision = 0
    vi.mocked(readKnowledgeFile).mockImplementation(async () => {
      revision += 1
      return {
        name: 'guide.md',
        path: 'guide.md',
        kind: 'markdown',
        mimeType: 'text/markdown',
        size: 20,
        content: `# Sessionless revision ${revision}`,
      }
    })

    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Open Knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    fireEvent.click(await within(tree).findByRole('treeitem', { name: /guide.md/ }))
    await screen.findByRole('heading', { name: 'Sessionless revision 1' })

    fireEvent.click(screen.getByRole('button', { name: 'Close knowledge panel' }))
    fireEvent.click(screen.getByRole('button', { name: 'Open Knowledge' }))
    expect(
      await screen.findByRole('heading', { name: 'Sessionless revision 2' }),
    ).toBeInTheDocument()
    expect(readKnowledgeFile).toHaveBeenCalledTimes(2)
  })

  it('keeps the readable Knowledge document visible when a mode refresh fails', async () => {
    mockKnowledgeRoots([knowledgeRoot])
    vi.mocked(listKnowledgeEntries).mockResolvedValue({
      path: '.',
      entries: [{
        name: 'guide.md',
        path: 'guide.md',
        kind: 'markdown',
        size: 20,
      }],
    })
    vi.mocked(readKnowledgeFile)
      .mockResolvedValueOnce({
        name: 'guide.md',
        path: 'guide.md',
        kind: 'markdown',
        mimeType: 'text/markdown',
        size: 20,
        content: '# Readable document',
      })
      .mockRejectedValueOnce(new Error('Knowledge refresh failed'))

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    fireEvent.click(await within(tree).findByRole('treeitem', { name: /guide.md/ }))
    await screen.findByRole('heading', { name: 'Readable document' })

    fireEvent.click(screen.getByRole('button', { name: 'Expand knowledge panel' }))
    expect(
      (await screen.findAllByText('Knowledge refresh failed'))
        .some((message) => !message.closest('[hidden]')),
    ).toBe(true)
    expect(
      screen.getByRole('heading', { name: 'Readable document' }),
    ).toBeInTheDocument()
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
    mockKnowledgeRoots([
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
    await screen.findByRole('heading', { name: 'Give this session a place to read' })
    expect(listKnowledgeEntries).not.toHaveBeenCalled()

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
      await findSessionAction('Unmute session notifications'),
    ).toBeInTheDocument()
  })

  it('picks a knowledge root from anywhere on the computer', async () => {
    mockKnowledgeRoots([
      {
        id: 'root-existing',
        computerId: computer.id,
        computerName: computer.name,
        path: '/home/tester/docs',
        name: 'docs',
        createdAt: '2026-08-01T00:00:00.000Z',
      },
    ])
    vi.mocked(listDirectories).mockResolvedValue({
      path: '/srv',
      parent: '/',
      directories: [{ name: 'docs', path: '/srv/docs' }],
    })
    mockAddedKnowledgeRoot({
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

    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    expect(
      screen.queryByRole('dialog', { name: 'Add knowledge root' }),
    ).not.toBeInTheDocument()
    fireEvent.click(
      await screen.findByRole('button', { name: 'New knowledge root' }),
    )
    const rootDialog = await screen.findByRole('dialog', {
      name: 'Add knowledge root',
    })
    // The picker walks the whole filesystem, not just the home directory.
    await waitFor(() =>
      expect(listDirectories).toHaveBeenCalledWith(computer.id, '~', 'all'),
    )
    fireEvent.click(await within(rootDialog).findByRole('button', { name: /docs/ }))
    const addFolder = within(rootDialog).getByRole('button', {
      name: 'Add this folder',
    })
    await waitFor(() => expect(addFolder).toBeEnabled())
    fireEvent.click(addFolder)
    await waitFor(() =>
      expect(addKnowledgeRoot).toHaveBeenCalledWith({
        computerId: computer.id,
        path: '/srv',
      }),
    )
  })

  it('keeps the general root picker available without a selected session', async () => {
    vi.mocked(listSessions).mockResolvedValue([])
    mockKnowledgeRoots([])

    render(<App />)
    await screen.findByText('No sessions here.')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    await waitFor(() => expect(listKnowledgeRoots).toHaveBeenCalled())

    expect(
      screen.queryByRole('dialog', { name: 'Add knowledge root' }),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'New knowledge root' }))
    expect(
      await screen.findByRole('dialog', { name: 'Add knowledge root' }),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(listDirectories).toHaveBeenCalledWith(computer.id, '~', 'all'),
    )
  })

  it('does not choose another computer for an offline session knowledge root', async () => {
    const offlineComputer = { ...computer, online: false }
    const offlineSession = {
      ...session,
      computerName: offlineComputer.name,
    }
    vi.mocked(listComputers).mockResolvedValue([
      offlineComputer,
      secondComputer,
    ])
    vi.mocked(listSessions).mockResolvedValue([offlineSession])
    vi.mocked(getSession).mockResolvedValue(offlineSession)
    mockKnowledgeRoots([])

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    await waitFor(() => expect(listKnowledgeRoots).toHaveBeenCalled())

    expect(
      screen.queryByRole('dialog', { name: 'Add knowledge root' }),
    ).not.toBeInTheDocument()
    expect(listDirectories).not.toHaveBeenCalledWith(
      secondComputer.id,
      '~',
      'all',
    )
  })

  it('does not reopen a cancelled root picker after root loading finishes', async () => {
    let finishRoots: (() => void) | undefined
    vi.mocked(listKnowledgeRoots).mockReturnValue(
      new Promise((resolve) => {
        finishRoots = () => resolve([])
      }),
    )

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
    fireEvent.click(screen.getByRole('button', { name: 'New knowledge root' }))
    const dialog = await screen.findByRole('dialog', {
      name: 'Add knowledge root',
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await act(async () => {
      finishRoots?.()
    })

    expect(
      screen.queryByRole('dialog', { name: 'Add knowledge root' }),
    ).not.toBeInTheDocument()
  })

  it('keeps knowledge open across sessions and follows the new one', async () => {
    localStorage.setItem('agentic-remote:reader-width', '420')
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(session)
    mockKnowledgeRoots([
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
    expect(screen.getByRole('separator', { name: 'Resize reader' }))
      .toHaveAttribute('aria-valuenow', '420')
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
    expect(screen.getByRole('separator', { name: 'Resize reader' }))
      .toHaveAttribute('aria-valuenow', '420')

    fireEvent.keyDown(window, { key: 'k', code: 'KeyK', altKey: true })
    expect(document.querySelector('.knowledge-panel')).toHaveAttribute('hidden')
    fireEvent.keyDown(window, { key: 'k', code: 'KeyK', altKey: true })
    expect(document.querySelector('.workspace')).toHaveClass(
      'workspace--docked',
    )
    expect(screen.getByRole('separator', { name: 'Resize reader' }))
      .toHaveAttribute('aria-valuenow', '420')
  })

  it('expands the knowledge panel over the conversation', async () => {
    mockKnowledgeRoots([
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
    expect(screen.queryByRole('separator', { name: 'Resize reader' }))
      .not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Minimize knowledge panel' }),
    )
    expect(document.querySelector('.workspace')).toHaveClass(
      'workspace--docked',
    )
    expect(document.querySelector('.conversation')).not.toHaveAttribute(
      'hidden',
    )
    expect(screen.getByRole('separator', { name: 'Resize reader' }))
      .toBeInTheDocument()
  })

  it.each(['docked', 'expanded'] as const)(
    'reopens Knowledge in its persisted %s mode',
    async (mode) => {
      localStorage.setItem(
        'agentic-remote:knowledge-mode',
        JSON.stringify('hidden'),
      )
      localStorage.setItem(
        'agentic-remote:knowledge-open-mode',
        JSON.stringify(mode),
      )
      localStorage.setItem('agentic-remote:reader-width', '420')
      mockKnowledgeRoots([knowledgeRoot])
      vi.mocked(listKnowledgeEntries).mockResolvedValue({
        path: '.',
        entries: [],
      })

      render(<App />)
      await screen.findAllByText('Project chat')
      fireEvent.keyDown(window, { key: 'k', code: 'KeyK', altKey: true })

      expect(document.querySelector('.workspace')).toHaveClass(
        `workspace--${mode}`,
      )
      if (mode === 'docked') {
        expect(screen.getByRole('separator', { name: 'Resize reader' }))
          .toHaveAttribute('aria-valuenow', '420')
      } else {
        expect(screen.queryByRole('separator', { name: 'Resize reader' }))
          .not.toBeInTheDocument()
      }
    },
  )

  it('restores the knowledge scroll position when the panel reopens', async () => {
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([])

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
    mockKnowledgeRoots([knowledgeRoot])

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
    mockKnowledgeRoots([knowledgeRoot])
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
    mockKnowledgeRoots([knowledgeRoot])

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
    mockKnowledgeRoots([knowledgeRoot])
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
    mockKnowledgeRoots([knowledgeRoot])

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
    fireEvent.keyDown(shell, { key: 'k', code: 'KeyK', altKey: true })
    expect(document.querySelector('.workspace')).toHaveClass(
      'workspace--expanded',
    )
  })

  it('lists the keyboard shortcuts in app settings', async () => {
    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.click(screen.getByRole('button', { name: 'App settings' }))

    const shortcuts = await screen.findByRole('heading', {
      name: 'Keyboard shortcuts',
    })
    const list = shortcuts.closest('section')?.querySelector('.shortcut-list')
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
    mockKnowledgeRoots([
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

  it('restores expansion for the initial sessionless root after switching roots', async () => {
    vi.mocked(listSessions).mockResolvedValue([])
    const firstRoot: KnowledgeRoot = {
      id: 'root-1',
      computerId: computer.id,
      computerName: computer.name,
      path: '/home/tester/docs',
      name: 'docs',
      createdAt: '2026-08-01T00:00:00.000Z',
    }
    const secondRoot = {
      ...firstRoot,
      id: 'root-2',
      path: '/home/tester/other',
      name: 'other',
    }
    mockKnowledgeRoots([firstRoot, secondRoot])
    localStorage.setItem(
      'agentic-remote:knowledge-root',
      JSON.stringify(firstRoot.id),
    )
    localStorage.setItem(
      'agentic-remote:knowledge-expanded',
      JSON.stringify({ [firstRoot.id]: ['guides'] }),
    )
    vi.mocked(listKnowledgeEntries).mockImplementation(
      async (rootId, path = '.') => ({
        path,
        parent: path === '.' ? undefined : '.',
        entries:
          rootId === firstRoot.id && path === '.'
            ? [{ name: 'guides', path: 'guides', kind: 'directory' }]
            : [],
      }),
    )

    render(<App />)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Session knowledge' }),
    )
    const tree = await screen.findByRole('navigation', { name: 'Knowledge' })
    const guides = await within(tree).findByRole('treeitem', {
      name: /guides/,
    })
    await waitFor(() =>
      expect(listKnowledgeEntries).toHaveBeenCalledWith(firstRoot.id, 'guides'),
    )
    expect(guides).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(guides)
    expect(guides).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(guides)
    expect(guides).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() =>
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:knowledge-expanded') || '{}',
        )[firstRoot.id],
      ).toEqual(['guides']),
    )

    await chooseKnowledgeRoot(secondRoot.id)
    await chooseKnowledgeRoot(firstRoot.id)
    expect(await within(tree).findByRole('treeitem', { name: /guides/ }))
      .toHaveAttribute('aria-expanded', 'true')
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([
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

  it('opens a Knowledge file from the URL and restores its link after reopening', async () => {
    vi.mocked(listSessions).mockResolvedValue([session, secondSession])
    vi.mocked(getSession).mockResolvedValue(secondSession)
    mockKnowledgeRoots([knowledgeRoot])
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
            {
              name: 'setup.md',
              path: 'guides/setup.md',
              kind: 'markdown',
            },
          ],
        },
      }),
    )
    vi.mocked(readKnowledgeFile).mockResolvedValue({
      path: 'guides/setup.md',
      name: 'setup.md',
      kind: 'markdown',
      mimeType: 'text/markdown',
      size: 20,
      content: '# Deep-linked setup',
    })
    window.history.replaceState(
      {},
      '',
      '/?computer=computer-1&session=session-2&file=guides%2Fsetup.md',
    )

    render(<App />)

    expect(
      await screen.findByRole('heading', { name: 'Deep-linked setup' }),
    ).toBeInTheDocument()
    expect(readKnowledgeFile).toHaveBeenCalledWith(
      'root-1',
      'guides/setup.md',
    )
    expect(document.querySelector('.workspace')).toHaveClass(
      'workspace--docked',
    )
    expect(window.location.search).toBe(
      '?computer=computer-1&session=session-2&file=guides%2Fsetup.md',
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Close knowledge panel' }),
    )
    await waitFor(() =>
      expect(window.location.search).toBe(
        '?computer=computer-1&session=session-2',
      ),
    )
    fireEvent.keyDown(window, { key: 'k', code: 'KeyK', altKey: true })
    await waitFor(() =>
      expect(window.location.search).toBe(
        '?computer=computer-1&session=session-2&file=guides%2Fsetup.md',
      ),
    )
  })

  it('follows Knowledge file changes from browser history', async () => {
    mockKnowledgeRoots([knowledgeRoot])
    vi.mocked(listKnowledgeEntries).mockImplementation(
      knowledgeListings({
        '.': {
          path: '.',
          entries: [
            { name: 'guides', path: 'guides', kind: 'directory' },
            { name: 'notes', path: 'notes', kind: 'directory' },
          ],
        },
        guides: {
          path: 'guides',
          parent: '.',
          entries: [],
        },
        notes: {
          path: 'notes',
          parent: '.',
          entries: [],
        },
      }),
    )
    vi.mocked(readKnowledgeFile).mockImplementation(async (_rootId, path) => ({
      path,
      name: path.split('/').at(-1) || path,
      kind: 'markdown',
      mimeType: 'text/markdown',
      size: 20,
      content: path === 'guides/setup.md' ? '# Setup' : '# Changed from URL',
    }))
    window.history.replaceState(
      {},
      '',
      '/?computer=computer-1&session=session-1&file=guides%2Fsetup.md',
    )
    render(<App />)
    await screen.findByRole('heading', { name: 'Setup' })

    act(() => {
      window.history.replaceState(
        {},
        '',
        '/?computer=computer-1&session=session-1&file=notes%2Fchanged.md',
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    await waitFor(() =>
      expect(readKnowledgeFile).toHaveBeenLastCalledWith(
        'root-1',
        'notes/changed.md',
      ),
    )
    expect(
      await screen.findByRole('heading', { name: 'Changed from URL' }),
    ).toBeInTheDocument()
    expect(window.location.search).toBe(
      '?computer=computer-1&session=session-1&file=notes%2Fchanged.md',
    )

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
        screen.queryByRole('heading', { name: 'Changed from URL' }),
      ).not.toBeInTheDocument(),
    )
    expect(window.location.search).toBe(
      '?computer=computer-1&session=session-1',
    )
  })

  it('does not reopen a file whose read lands after going back to the folder', async () => {
    mockKnowledgeRoots([knowledgeRoot])
    vi.mocked(listKnowledgeEntries).mockImplementation(
      knowledgeListings({
        '.': {
          path: '.',
          entries: [{ name: 'guides', path: 'guides', kind: 'directory' }],
        },
        guides: { path: 'guides', parent: '.', entries: [] },
      }),
    )
    let releaseRead: (() => void) | undefined
    vi.mocked(readKnowledgeFile).mockImplementation(async (_rootId, path) => {
      await new Promise<void>((resolve) => {
        releaseRead = resolve
      })
      return {
        path,
        name: path.split('/').at(-1) || path,
        kind: 'markdown',
        mimeType: 'text/markdown',
        size: 20,
        content: '# Held open',
      }
    })
    window.history.replaceState(
      {},
      '',
      '/?computer=computer-1&session=session-1',
    )
    render(<App />)
    await screen.findAllByText('Project chat')

    act(() => {
      window.history.replaceState(
        {},
        '',
        '/?computer=computer-1&session=session-1&file=guides%2Fheld.md',
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    await waitFor(() => expect(releaseRead).toBeDefined())

    act(() => {
      window.history.replaceState(
        {},
        '',
        '/?computer=computer-1&session=session-1',
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    // The read the reader walked away from only answers now. Going back must
    // hold, rather than being undone by work it already abandoned.
    await act(async () => {
      releaseRead?.()
      await Promise.resolve()
    })

    await waitFor(() =>
      expect(window.location.search).toBe(
        '?computer=computer-1&session=session-1',
      ),
    )
    expect(
      screen.queryByRole('heading', { name: 'Held open' }),
    ).not.toBeInTheDocument()
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
    fireEvent.click(sessionAction('Close session'))

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
    mockKnowledgeRoots([
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
      sessionAction('Mute session notifications'),
    )
    await findSessionAction('Unmute session notifications')

    fireEvent.click(sessionAction('Clear conversation'))
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
      await findSessionAction('Unmute session notifications'),
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

  it.each([false, true])(
    'keeps clear ownership when an upsert overtakes selection cleanup (local clear: %s)',
    async (localClear) => {
      window.history.replaceState({}, '', '/?computer=computer-1&session=session-1')
      const replacement: ManagedSession = {
        ...session, id: 'session-1-cleared', title: 'Cleared conversation',
        replacedSessionIds: [session.id], messages: [],
      }
      vi.mocked(listSessions).mockResolvedValue([secondSession, session])
      vi.mocked(getSession).mockImplementation(async (_computerId, id) =>
        id === replacement.id ? replacement : id === secondSession.id ? secondSession : session,
      )
      let answerClear: ((value: ManagedSession) => void) | undefined
      vi.mocked(clearConversation).mockImplementation(() =>
        new Promise((resolve) => { answerClear = resolve }),
      )
      render(<App />)
      const textarea = await screen.findByLabelText('Message')
      fireEvent.change(textarea, { target: { value: 'Continue after clear' } })
      await waitFor(() => expect(MockWebSocket.instances[0]).toBeDefined())
      if (localClear) {
        fireEvent.click(sessionAction('Clear conversation'))
        await waitFor(() => expect(answerClear).toBeDefined())
      }
      // This earlier effect delivers the next frame after removal rendered,
      // before that render's selection cleanup has consumed its old list.
      const badge = vi.spyOn(shell, 'setShellBadge').mockImplementationOnce(() => {
        MockWebSocket.instances[0]?.onmessage?.({
          data: JSON.stringify({ type: 'session.upserted', session: replacement }),
        } as MessageEvent)
      })
      try {
        await act(async () => {
          MockWebSocket.instances[0]?.onmessage?.({
            data: JSON.stringify({
              type: 'session.removed', computerId: computer.id,
              sessionId: session.id, replacedBy: replacement.id,
            }),
          } as MessageEvent)
        })
        expect(document.querySelector('.session-item--active')?.textContent)
          .toContain('Cleared conversation')
        expect(screen.getByLabelText('Message')).toHaveValue('Continue after clear')
      } finally {
        badge.mockRestore()
        await act(async () => { answerClear?.(replacement) })
      }
      expect(document.querySelector('.session-item--active')?.textContent)
        .toContain('Cleared conversation')
    },
  )

  it.each([
    ['accept', 'removal'],
    ['reject', 'removal'],
    ['accept', 'snapshot'],
    ['reject', 'snapshot'],
  ] as const)(
    'holds an unlinked local clear until its response can %s the replacement after %s',
    async (outcome, source) => {
      window.history.replaceState({}, '', '/?computer=computer-1&session=session-1')
      const replacement: ManagedSession = {
        ...session, id: 'session-1-cleared', title: 'Cleared conversation',
        replacedSessionIds: [session.id], messages: [],
      }
      vi.mocked(listSessions).mockResolvedValue([secondSession, session])
      vi.mocked(getSession).mockImplementation(async (_computerId, id) =>
        id === replacement.id ? replacement : id === secondSession.id ? secondSession : session,
      )
      let accept: ((value: ManagedSession) => void) | undefined
      let reject: ((error: Error) => void) | undefined
      vi.mocked(clearConversation).mockImplementation(() => new Promise((resolve, refuse) => {
        accept = resolve
        reject = refuse
      }))
      render(<App />)
      await screen.findAllByText('Project chat')
      fireEvent.click(sessionAction('Clear conversation'))
      await waitFor(() => expect(accept).toBeDefined())
      if (source === 'removal') {
        await act(async () => {
          MockWebSocket.instances[0]?.onmessage?.({
            data: JSON.stringify({
              type: 'session.removed', computerId: computer.id, sessionId: session.id,
            }),
          } as MessageEvent)
        })
      } else {
        vi.mocked(listSessions).mockResolvedValue([secondSession])
        await act(async () => {
          MockWebSocket.instances[0]?.onopen?.()
          await Promise.resolve()
        })
      }
      expect(new URLSearchParams(window.location.search).get('session')).toBe(session.id)
      await act(async () => {
        if (outcome === 'accept') accept?.(replacement)
        else reject?.(new Error('Clear response was lost'))
      })
      await waitFor(() => expect(document.querySelector('.session-item--active')?.textContent)
        .toContain(outcome === 'accept' ? 'Cleared conversation' : 'Second chat'))
    },
  )

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

  it.each(['stay', 'navigate', 'replace'] as const)(
    'binds a failed submission to the returned recovery token across %s',
    async (mode) => {
      const oldToken = '2026-09-06T00:00:00.000Z'
      const nextToken = 'resend:11111111-1111-4111-8111-111111111111'
      const submitted = 'Edited recovered request'
      let current: ManagedSession = {
        ...session, revision: 20, messages: [],
        failedPrompt: { content: 'Original recovered request', failedAt: oldToken, uncertain: true },
      }
      localStorage.setItem('agentic-remote:composer-drafts', JSON.stringify({
        'computer-1:session-2': 'Unrelated second-session draft',
      }))
      vi.mocked(listSessions).mockResolvedValue([current, secondSession])
      vi.mocked(getSession).mockImplementation(async (_computer, id) =>
        id === secondSession.id ? secondSession : current,
      )
      let refuse!: (error: unknown) => void
      vi.mocked(sendMessage).mockImplementationOnce(() => new Promise((_resolve, reject) => { refuse = reject }))
      render(<App />)
      await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue('Original recovered request'))
      fireEvent.change(screen.getByLabelText('Message'), { target: { value: submitted } })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() => expect(sendMessage).toHaveBeenCalledTimes(1))
      current = {
        ...current, revision: 21,
        failedPrompt: { content: submitted, failedAt: nextToken, uncertain: true },
      }
      await act(async () => {
        MockWebSocket.instances[0]?.onmessage?.({
          data: JSON.stringify({ type: 'session.upserted', session: current }),
        } as MessageEvent)
      })
      if (mode === 'replace') {
        current = { ...current, id: 'session-1-replaced', revision: 22, replacedSessionIds: ['session-1'] }
        await act(async () => {
          MockWebSocket.instances[0]?.onmessage?.({
            data: JSON.stringify({
              type: 'session.removed', computerId: computer.id,
              sessionId: session.id, replacedBy: current.id,
            }),
          } as MessageEvent)
          MockWebSocket.instances[0]?.onmessage?.({
            data: JSON.stringify({ type: 'session.upserted', session: current }),
          } as MessageEvent)
        })
      } else if (mode === 'navigate') {
        fireEvent.click(screen.getByText('Second chat'))
        await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue('Unrelated second-session draft'))
      }
      const receipt = { sessionId: current.id, failedAt: nextToken, accepted: false }
      await act(async () => {
        refuse(Object.assign(new Error('Delivery was not completed'), { statusCode: 409, submission: receipt }))
      })
      const key = `${computer.id}:${current.id}`
      await waitFor(() => expect(JSON.parse(localStorage.getItem('agentic-remote:composer-draft-failures') || '{}')[key])
        .toBe(nextToken))
      if (mode === 'navigate') {
        expect(screen.getByLabelText('Message')).toHaveValue('Unrelated second-session draft')
        fireEvent.click(screen.getByText('Project chat'))
      }
      await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(submitted))
      vi.mocked(sendMessage).mockResolvedValue({ ...current, revision: 23, failedPrompt: undefined })
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await waitFor(() => expect(sendMessage).toHaveBeenLastCalledWith(
        computer.id, current.id, expect.objectContaining({
          content: submitted, acknowledgesFailure: nextToken,
        }),
      ))
      expect(JSON.parse(localStorage.getItem('agentic-remote:composer-drafts') || '{}')['computer-1:session-2'])
        .toBe('Unrelated second-session draft')
    },
  )

  it('does not restore a draft when a failed response confirms the recovery was accepted', async () => {
    const oldToken = '2026-09-06T00:00:00.000Z'
    const nextToken = 'resend:22222222-2222-4222-8222-222222222222'
    const content = 'Already delivered recovery'
    let current: ManagedSession = {
      ...session, revision: 30, messages: [],
      failedPrompt: { content, failedAt: oldToken, uncertain: true },
    }
    vi.mocked(listSessions).mockResolvedValue([current])
    vi.mocked(getSession).mockImplementation(async () => current)
    let refuse!: (error: unknown) => void
    vi.mocked(sendMessage).mockImplementationOnce(() => new Promise((_resolve, reject) => { refuse = reject }))
    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(content))
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    current = { ...current, revision: 31, failedPrompt: { content, failedAt: nextToken, uncertain: true } }
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: current }),
      } as MessageEvent)
      refuse(Object.assign(new Error('Delivered; acknowledgement will be retried'), {
        statusCode: 409, submission: { sessionId: session.id, failedAt: nextToken, accepted: true },
      }))
    })
    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(''))
    expect(sendMessage).toHaveBeenCalledOnce()
    current = { ...current, revision: 32, failedPrompt: undefined }
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: current }),
      } as MessageEvent)
    })
    expect(screen.getByLabelText('Message')).toHaveValue('')
  })

  it('refuses recovery dispatch when browser storage cannot persist its ownership', async () => {
    const token = '2026-09-06T00:00:00.000Z'
    const content = 'Keep this recovery bound in memory'
    let current: ManagedSession = {
      ...session, revision: 40, messages: [],
      failedPrompt: { content, failedAt: token, uncertain: true },
    }
    vi.mocked(listSessions).mockImplementation(async () => [current])
    vi.mocked(getSession).mockImplementation(async () => current)
    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(content))
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage writes are unavailable')
    })
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
      await screen.findByText(/Message was not sent/)
      expect(sendMessage).not.toHaveBeenCalled()
      expect(screen.getByLabelText('Message')).toHaveValue(content)
      expect(
        JSON.parse(
          localStorage.getItem('agentic-remote:composer-draft-failures') || '{}',
        ),
      ).toMatchObject({ 'computer-1:session-1': token })
    } finally {
      setItem.mockRestore()
    }
  })

  it('retains a recovery binding across a lost response, an absent marker and browser reload', async () => {
    const token = '2026-09-06T00:00:00.000Z'
    const content = 'Do not anonymously replay this draft'
    let current: ManagedSession = {
      ...session, revision: 40, messages: [],
      failedPrompt: { content, failedAt: token, uncertain: true },
    }
    vi.mocked(listSessions).mockImplementation(async () => [current])
    vi.mocked(getSession).mockImplementation(async () => current)
    let refuse!: (error: unknown) => void
    vi.mocked(sendMessage).mockImplementationOnce(() => new Promise((_resolve, reject) => { refuse = reject }))
    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(content))
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    current = { ...current, revision: 42, failedPrompt: undefined }
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: current }),
      } as MessageEvent)
      refuse(new Error('The response connection was lost'))
    })
    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(content))
    await waitFor(() => expect(JSON.parse(localStorage.getItem('agentic-remote:composer-submission-failures') || '{}'))
      .toEqual({ 'computer-1:session-1': token }))
    cleanup()
    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(content))
    vi.mocked(sendMessage).mockRejectedValueOnce(new Error('That recovery decision was already used'))
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenLastCalledWith(
      computer.id, session.id, expect.objectContaining({ content, acknowledgesFailure: token }),
    ))
  })

  it('moves the bound failed draft when replacement arrives after the HTTP error', async () => {
    const token = '2026-09-06T00:00:00.000Z'
    const next = 'resend:33333333-3333-4333-8333-333333333333'
    const content = 'Edited draft that follows a late replacement'
    let current: ManagedSession = {
      ...session, revision: 50, messages: [],
      failedPrompt: { content, failedAt: token, uncertain: true },
    }
    vi.mocked(listSessions).mockImplementation(async () => [current, secondSession])
    vi.mocked(getSession).mockImplementation(async (_computer, id) => id === secondSession.id ? secondSession : current)
    vi.mocked(sendMessage).mockRejectedValueOnce(Object.assign(new Error('Dispatch was interrupted'), {
      statusCode: 409, submission: { sessionId: 'late-replacement', failedAt: next, accepted: false },
    }))
    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(content))
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(JSON.parse(localStorage.getItem('agentic-remote:composer-draft-failures') || '{}')['computer-1:session-1']).toBe(next))
    current = {
      ...current, id: 'late-replacement', revision: 52, replacedSessionIds: [session.id],
      failedPrompt: { content, failedAt: next, uncertain: true },
    }
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'session.removed', computerId: computer.id, sessionId: session.id, replacedBy: current.id }),
      } as MessageEvent)
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'session.upserted', session: current }),
      } as MessageEvent)
    })
    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(content))
    vi.mocked(sendMessage).mockResolvedValue({ ...current, revision: 53, failedPrompt: undefined })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenLastCalledWith(
      computer.id, current.id, expect.objectContaining({ acknowledgesFailure: next, content }),
    ))
  })

  it('does not put an accepted background submission into the newly selected session', async () => {
    const token = '2026-09-06T00:00:00.000Z'
    const next = 'resend:44444444-4444-4444-8444-444444444444'
    const content = 'Accepted in the first session'
    let current: ManagedSession = {
      ...session, revision: 60, messages: [],
      failedPrompt: { content, failedAt: token, uncertain: true },
    }
    localStorage.setItem('agentic-remote:composer-drafts', JSON.stringify({ 'computer-1:session-2': 'Keep the other draft' }))
    vi.mocked(listSessions).mockImplementation(async () => [current, secondSession])
    vi.mocked(getSession).mockImplementation(async (_computer, id) => id === secondSession.id ? secondSession : current)
    let refuse!: (error: unknown) => void
    vi.mocked(sendMessage).mockImplementationOnce(() => new Promise((_resolve, reject) => { refuse = reject }))
    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(content))
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    fireEvent.click(screen.getByText('Second chat'))
    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue('Keep the other draft'))
    current = { ...current, revision: 62, failedPrompt: undefined }
    await act(async () => {
      refuse(Object.assign(new Error('Accepted; acknowledgement is pending'), {
        statusCode: 409, submission: { sessionId: session.id, failedAt: next, accepted: true },
      }))
    })
    expect(screen.getByLabelText('Message')).toHaveValue('Keep the other draft')
    fireEvent.click(screen.getByText('Project chat'))
    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue(''))
    expect(sendMessage).toHaveBeenCalledOnce()
  })

  it('does not resurrect a deleted session when its recovery response arrives late', async () => {
    const token = '2026-09-06T00:00:00.000Z'
    const current: ManagedSession = {
      ...session, messages: [],
      failedPrompt: { content: 'A deleted recovery draft', failedAt: token },
    }
    vi.mocked(listSessions).mockResolvedValue([current, secondSession])
    vi.mocked(getSession).mockImplementation(async (_computer, id) => id === secondSession.id ? secondSession : current)
    let refuse!: (error: unknown) => void
    vi.mocked(sendMessage).mockImplementationOnce(() => new Promise((_resolve, reject) => { refuse = reject }))
    render(<App />)
    await waitFor(() => expect(screen.getByLabelText('Message')).toHaveValue('A deleted recovery draft'))
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce())
    await act(async () => {
      MockWebSocket.instances[0]?.onmessage?.({
        data: JSON.stringify({ type: 'session.removed', computerId: computer.id, sessionId: session.id }),
      } as MessageEvent)
    })
    await act(async () => {
      refuse(Object.assign(new Error('The owner disappeared'), {
        statusCode: 409, submission: { sessionId: session.id, failedAt: 'resend:deleted', accepted: false },
      }))
    })
    expect(JSON.parse(localStorage.getItem('agentic-remote:composer-drafts') || '{}')['computer-1:session-1']).toBeUndefined()
    expect(JSON.parse(localStorage.getItem('agentic-remote:composer-draft-failures') || '{}')['computer-1:session-1']).toBeUndefined()
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

    fireEvent.click(sessionAction('Clear conversation'))
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

    fireEvent.click(sessionAction('Clear conversation'))
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([
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
    const rootButton = screen.getByRole('button', { name: 'Choose Knowledge root' })
    await waitFor(() => expect(rootButton).toBeEnabled())
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
    mockKnowledgeRoots([
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
    fireEvent.click(sessionAction('Clear conversation'))

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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([])
    vi.mocked(listDirectories).mockResolvedValue({
      path: '/srv',
      parent: '/',
      directories: [{ name: 'docs', path: '/srv/docs' }],
    })
    mockAddedKnowledgeRoot({
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
      await screen.findByRole('button', { name: 'New knowledge root' }),
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([
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
    await chooseKnowledgeRoot('root-2')
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([])

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
    mockKnowledgeRoots([
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

  it.each([false, true])('carries the position across a clear even as the removal arrives (metadata warning: %s)', async (metadataWarning) => {
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
    mockKnowledgeRoots([])
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)
    await screen.findAllByText('Project chat')
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Keep this draft across clear' } })
    fireEvent.click(sessionAction('Clear conversation'))
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
      if (metadataWarning) {
        MockWebSocket.instances[0]?.onmessage?.({
          data: JSON.stringify({
            type: 'error', computerId: computer.id, sessionId: replacement.id,
            message: 'Conversation cleared, but its Knowledge folder metadata could not be saved. Open Knowledge or reload to retry.',
          }),
        } as MessageEvent)
      }
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
    expect(clearConversation).toHaveBeenCalledOnce()
    expect(screen.getByLabelText('Message')).toHaveValue('Keep this draft across clear')
    expect(window.location.search).toContain('session=session-1-cleared')
    if (metadataWarning) {
      expect(within(screen.getByRole('main'))
        .getByText(/Conversation cleared, but its Knowledge folder metadata/)).toBeVisible()
    }
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
    mockKnowledgeRoots([])

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
    mockKnowledgeRoots([])

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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([])

    render(<App />)
    await screen.findAllByText('Project chat')
    await waitFor(() =>
      expect(
        sessionAction('Unmute session notifications'),
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
      sessionAction('Unmute session notifications'),
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
    mockKnowledgeRoots([
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
    mockKnowledgeRoots([])
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)
    const textarea = await screen.findByLabelText('Message')
    fireEvent.change(textarea, { target: { value: 'Draft worth keeping' } })
    fireEvent.click(sessionAction('Clear conversation'))
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
      sessionAction('Unmute session notifications'),
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
    await findSessionAction('Unmute session notifications')

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
      await findSessionAction('Unmute session notifications'),
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
    mockKnowledgeRoots([
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
      screen.queryByRole('button', { name: 'Add knowledge root' }),
    ).not.toBeInTheDocument()
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
    mockKnowledgeRoots([
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
    fireEvent.click(screen.getByRole('button', { name: 'Session knowledge' }))
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
