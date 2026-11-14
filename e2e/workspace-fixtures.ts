import type { Page, Route, WebSocketRoute } from '@playwright/test'
import { defaultHubFeatureFlags } from '../shared/feature-flags'
import type { DreamerSnapshot } from '../shared/dreamer'
import type { ManagerSnapshot } from '../shared/manager'
import {
  ORACLE_VOICE_PROTOCOL,
  ORACLE_VOICE_SAMPLE_RATE,
  type VoiceCapabilities,
} from '../shared/oracle-voice'
import {
  applySettingsChanges,
  applySettingsImport,
  SettingsRequestError,
  validateSettingsChanges,
  validateSettingsImport,
  type SettingsProfileRecord,
  type SettingsProfileSnapshot,
  type SettingsUpdateResult,
} from '../shared/settings-profile'
import type { KnowledgePosition } from '../src/knowledge-position'
import type {
  BackgroundTaskSnapshot,
  ComputerSummary,
  HubEvent,
  KnowledgeRoot,
  ManagedSession,
  RuntimeModelOption,
  SessionKnowledgeBinding,
  SessionOrderSnapshot,
  WorkspaceFile,
  WorkspaceListing,
} from '../shared/contracts'
import {
  joinKnowledgeRelativePath,
  rebaseKnowledgeRelativePath,
} from '../shared/knowledge-path'
import { closedSessionContext } from '../shared/closed-sessions'

export const FIXTURE_NOW = '2026-09-04T16:20:00.000Z'
export const SELECTED_SESSION_ID = 'fixture-plan-workspace'
export const PENDING_SESSION_ID = 'fixture-review-recovery'
export const PERMISSION_SESSION_ID = 'fixture-approve-check'
export const BACKGROUND_SESSION_ID = 'fixture-check-links'
export const IDLE_SESSION_ID = 'fixture-draft-summary'
export const SUSPENDED_SESSION_ID = 'fixture-sketch-handoff'
export const KNOWLEDGE_ROOT_ID = 'fixture-field-notes'
export const SECOND_KNOWLEDGE_ROOT_ID = 'fixture-build-playbooks'
export const KNOWLEDGE_FILE_PATH = 'handbook/agent-workspace.md'
export const KNOWLEDGE_DOCUMENT_TITLE = 'Agent workspace field guide'
export const CONTEXT_EXAMPLE = '{\n  "computer": "Studio",\n  "folder": "~/field-notes",\n  "mode": "plan"\n}\n'

export const fixtureComputers: ComputerSummary[] = [
  {
    id: 'fixture-studio',
    name: 'Studio',
    isLocal: true,
    online: true,
    providers: [
      {
        id: 'copilot',
        name: 'Copilot',
        available: true,
        terminalBacked: true,
        supportsTmuxMigration: true,
        supportsBackgroundTasks: true,
        supportsRecoverableClose: true,
      },
      {
        id: 'claude',
        name: 'Claude Agent',
        available: true,
        terminalBacked: false,
        supportsRecoverableClose: true,
      },
    ],
  },
  {
    id: 'fixture-build',
    name: 'Build node',
    isLocal: false,
    online: true,
    providers: [
      {
        id: 'copilot',
        name: 'Copilot',
        available: true,
        terminalBacked: true,
        supportsBackgroundTasks: true,
        supportsRecoverableClose: true,
      },
      {
        id: 'claude',
        name: 'Claude Agent',
        available: true,
        terminalBacked: false,
        supportsRecoverableClose: true,
      },
    ],
  },
  {
    id: 'fixture-travel',
    name: 'Travel laptop',
    isLocal: false,
    online: false,
    providers: [
      {
        id: 'copilot',
        name: 'Copilot',
        available: true,
        terminalBacked: true,
      },
    ],
  },
]

const runtime = {
  model: 'fixture-model',
  reasoningEffort: 'medium',
  contextTier: 'default',
  contextTokens: 12_400,
  contextTokenLimit: 128_000,
  mode: 'interactive',
  allowAllPermissions: false,
}

export const fixtureModels: RuntimeModelOption[] = [
  {
    id: 'fixture-model',
    name: 'Reasoning model',
    description: 'Synthetic model used only in this browser fixture.',
    reasoningEfforts: ['low', 'medium', 'high'],
    contextTiers: ['default'],
    contextTokenLimits: { default: 128_000 },
  },
]

export const fixtureSessions: ManagedSession[] = [
  {
    id: SELECTED_SESSION_ID,
    computerId: 'fixture-studio',
    computerName: 'Studio',
    title: 'Plan the knowledge workspace',
    cwd: '/home/demo/field-notes',
    provider: 'copilot',
    executionMode: 'tmux',
    revision: 1,
    updatedAt: '2026-09-04T16:18:00.000Z',
    status: 'idle',
    isOpen: true,
    runtime: { ...runtime, mode: 'plan' },
    messages: [
      {
        id: 'fixture-plan-user',
        role: 'user',
        content:
          'Help me make this workspace easier to scan. Keep the conversation close while I read our field guide.',
        createdAt: '2026-09-04T16:15:00.000Z',
      },
      {
        id: 'fixture-plan-assistant',
        role: 'assistant',
        content:
          'I suggest three small changes:\n\n' +
          '1. Make questions and permission requests easy to spot.\n' +
          '2. Keep each computer and its sessions together.\n' +
          '3. Let a document become a question without losing your place.\n\n' +
          'The field guide is open beside us. Which part should we refine first?',
        createdAt: '2026-09-04T16:18:00.000Z',
      },
    ],
  },
  {
    id: PENDING_SESSION_ID,
    computerId: 'fixture-studio',
    computerName: 'Studio',
    title: 'Review session recovery',
    cwd: '/home/demo/field-notes',
    provider: 'claude',
    executionMode: 'sdk',
    revision: 1,
    updatedAt: '2026-09-04T16:16:00.000Z',
    status: 'waiting',
    isOpen: true,
    runtime,
    messages: [
      {
        id: 'fixture-recovery-user',
        role: 'user',
        content: 'Review how a reader returns to work after reconnecting.',
        createdAt: '2026-09-04T16:13:00.000Z',
      },
      {
        id: 'fixture-recovery-assistant',
        role: 'assistant',
        content:
          'The conversation and document can keep their places. I need one decision before I finish the recovery checklist.',
        createdAt: '2026-09-04T16:16:00.000Z',
      },
    ],
    pendingUserInput: {
      requestId: 'fixture-recovery-question',
      question: 'What should the workspace restore first?',
      choices: ['The last conversation', 'The last document', 'Both together'],
      allowFreeform: true,
    },
  },
  {
    id: IDLE_SESSION_ID,
    computerId: 'fixture-studio',
    computerName: 'Studio',
    title: 'Draft the weekly summary',
    cwd: '/home/demo/field-notes',
    provider: 'copilot',
    executionMode: 'sdk',
    revision: 1,
    updatedAt: '2026-09-04T15:40:00.000Z',
    status: 'idle',
    isOpen: true,
    runtime,
    messages: [
      {
        id: 'fixture-summary-assistant',
        role: 'assistant',
        content: 'The short summary is ready for your next review.',
        createdAt: '2026-09-04T15:40:00.000Z',
      },
    ],
  },
  {
    id: PERMISSION_SESSION_ID,
    computerId: 'fixture-build',
    computerName: 'Build node',
    title: 'Approve the document check',
    cwd: '/home/demo/workspace-checks',
    provider: 'claude',
    executionMode: 'sdk',
    revision: 1,
    updatedAt: '2026-09-04T16:14:00.000Z',
    status: 'waiting',
    isOpen: true,
    runtime,
    messages: [
      {
        id: 'fixture-permission-assistant',
        role: 'assistant',
        content:
          'I can validate the example documents next. This needs your approval before the local check starts.',
        createdAt: '2026-09-04T16:14:00.000Z',
      },
    ],
    pendingPermission: {
      requestId: 'fixture-document-permission',
      title: 'Allow the document validation command?',
      kind: 'shell',
      options: [
        { optionId: 'allow-once', name: 'Allow once', kind: 'allow_once' },
        { optionId: 'deny', name: 'Not now', kind: 'reject_once' },
      ],
    },
  },
  {
    id: BACKGROUND_SESSION_ID,
    computerId: 'fixture-build',
    computerName: 'Build node',
    title: 'Check handbook links',
    cwd: '/home/demo/workspace-checks',
    provider: 'copilot',
    executionMode: 'tmux',
    revision: 1,
    updatedAt: '2026-09-04T16:12:00.000Z',
    status: 'idle',
    isOpen: true,
    runtime,
    messages: [
      {
        id: 'fixture-links-assistant',
        role: 'assistant',
        content:
          'The link check is running in the background. You can keep reading while it checks the handbook references.',
        createdAt: '2026-09-04T16:12:00.000Z',
      },
    ],
  },
  {
    id: SUSPENDED_SESSION_ID,
    computerId: 'fixture-travel',
    computerName: 'Travel laptop',
    title: 'Sketch the next handoff',
    cwd: '/home/demo/notes',
    provider: 'copilot',
    executionMode: 'sdk',
    revision: 1,
    updatedAt: '2026-09-03T14:30:00.000Z',
    status: 'idle',
    suspended: true,
    isOpen: true,
    runtime,
    messages: [
      {
        id: 'fixture-handoff-assistant',
        role: 'assistant',
        content: 'This sketch is saved. Resume it when this computer is online.',
        createdAt: '2026-09-03T14:30:00.000Z',
      },
    ],
  },
]

export const fixtureKnowledgeRoots: KnowledgeRoot[] = [
  {
    id: KNOWLEDGE_ROOT_ID,
    computerId: 'fixture-studio',
    computerName: 'Studio',
    path: '/home/demo/field-notes',
    name: 'Field notes',
    createdAt: '2026-09-01T09:00:00.000Z',
  },
  {
    id: SECOND_KNOWLEDGE_ROOT_ID,
    computerId: 'fixture-build',
    computerName: 'Build node',
    path: '/home/demo/workspace-checks/docs',
    name: 'Build playbooks',
    createdAt: '2026-09-01T09:00:00.000Z',
  },
]

const documents: Record<string, string> = {
  [KNOWLEDGE_FILE_PATH]:
    '# Agent workspace field guide\n\n' +
    'A quiet place to supervise work, read a note, and decide what comes next.\n\n' +
    '## Keep the important things close\n\n' +
    '| Surface | Purpose |\n' +
    '| --- | --- |\n' +
    '| Sessions | Find work that needs you |\n' +
    '| Conversation | Give the next direction |\n' +
    '| Knowledge | Read without losing context |\n\n' +
    '## A small review loop\n\n' +
    '- [x] Keep computers visible, including offline ones.\n' +
    '- [x] Remember the document for each session.\n' +
    '- [ ] Turn a useful passage into a focused question.\n\n' +
    'Continue with the [release checklist](release-checklist.md).\n',
  'handbook/release-checklist.md':
    '# Release checklist\n\n' +
    'A short rehearsal for a clear, recoverable workspace.\n\n' +
    '## Before sharing\n\n' +
    '- [x] Use fictional session content.\n' +
    '- [x] Check the wide and narrow layouts.\n' +
    '- [ ] Read a document and return to the conversation.\n\n' +
    '## Recovery\n\n' +
    'Keep the selected session, its draft, and its reading position together.\n\n' +
    'Return to the [workspace field guide](agent-workspace.md).\n',
  'reference/reading-patterns.md':
    '# Reading patterns\n\n' +
    'Open a short note beside a conversation. Expand it when the document needs room, ' +
    'then return to the same draft.\n',
  'reference/session-context.md':
    '# Session context\n\n' +
    'A small reference for keeping the work and its owner clear.\n\n' +
    '> The session stays on its owning computer. Reading a note does not move it.\n\n' +
    '## Example configuration\n\n```json\n' + CONTEXT_EXAMPLE + '```\n\n' +
    'Use this as context for a draft, then choose when to send.\n',
}

export const fixtureKnowledgeFiles: Record<string, WorkspaceFile> =
  Object.fromEntries(
    Object.entries(documents).map(([path, content]) => [
      path,
      {
        name: path.split('/').at(-1)!,
        path,
        kind: 'markdown' as const,
        mimeType: 'text/markdown',
        size: Buffer.byteLength(content),
        content,
      },
    ]),
  )

export const fixtureKnowledgeListings: Record<string, WorkspaceListing> = {
  '.': {
    path: '.',
    entries: [
      { name: 'handbook', path: 'handbook', kind: 'directory' },
      { name: 'reference', path: 'reference', kind: 'directory' },
    ],
  },
  handbook: {
    path: 'handbook',
    parent: '.',
    entries: [
      fixtureKnowledgeFiles[KNOWLEDGE_FILE_PATH],
      fixtureKnowledgeFiles['handbook/release-checklist.md'],
    ].map(({ name, path, kind, size }) => ({ name, path, kind, size })),
  },
  reference: {
    path: 'reference',
    parent: '.',
    entries: [
      {
        name: 'reading-patterns.md',
        path: 'reference/reading-patterns.md',
        kind: 'markdown',
      },
      {
        name: 'session-context.md',
        path: 'reference/session-context.md',
        kind: 'markdown',
      },
    ],
  },
}

export const fixtureBackgroundTasks: Record<string, BackgroundTaskSnapshot> = {
  [BACKGROUND_SESSION_ID]: {
    supported: true,
    runningCount: 1,
    tasks: [
      {
        id: 'fixture-handbook-link-task',
        type: 'agent',
        description: 'Check handbook references',
        prompt: 'Check the handbook links without changing the files.',
        status: 'running',
        startedAt: '2026-09-04T16:12:00.000Z',
        activeTimeMs: 24_000,
        model: 'fixture-model',
        executionMode: 'background',
        agentType: 'document-reviewer',
        progress: {
          type: 'agent',
          latestIntent: 'Checking relative links in the handbook',
          recentActivity: [
            {
              message: 'Validated the field guide references.',
              timestamp: '2026-09-04T16:19:00.000Z',
            },
          ],
        },
        canCancel: true,
      },
    ],
  },
}

export const fixtureKnowledgePositions = Object.fromEntries(
  fixtureSessions.map((session) => [
    `${session.computerId}:${session.id}`,
    {
      rootId: KNOWLEDGE_ROOT_ID,
      path: 'handbook',
      file:
        session.id === PENDING_SESSION_ID
          ? 'handbook/release-checklist.md'
          : KNOWLEDGE_FILE_PATH,
    },
  ]),
)

export const fixtureEndpoints = [
  'GET /api/features',
  'GET /api/computers',
  'GET /api/sessions',
  'GET /api/history',
  'GET /api/closed-sessions',
  'GET /api/push/settings',
  'GET /api/version',
  'GET /api/knowledge/roots',
  'GET /api/knowledge/roots/:rootId/entries?path=.',
  'GET /api/knowledge/roots/:rootId/file?path=handbook/agent-workspace.md',
  'GET /api/computers/:computerId/directories?path=~&scope=all',
  'GET /api/computers/:computerId/providers/:provider/runtime',
  'GET /api/computers/:computerId/sessions/:sessionId',
  'GET /api/computers/:computerId/sessions/:sessionId/commands',
  'GET /api/computers/:computerId/sessions/:sessionId/runtime',
  'GET /api/computers/:computerId/sessions/:sessionId/tasks',
  'GET /api/computers/:computerId/sessions/:sessionId/workspace?path=.',
  'GET /api/computers/:computerId/sessions/:sessionId/workspace/file?path=handbook/agent-workspace.md',
  'POST /api/computers/:computerId/sessions/:sessionId/open',
  'POST /api/computers/:computerId/sessions/:sessionId/close',
  'DELETE /api/computers/:computerId/sessions/:sessionId',
  'WS /api/events',
] as const

export interface WorkspaceFixtureOptions {
  baseUrl: string
  selectedSessionId?: string
  knowledgeMode?: 'hidden' | 'docked' | 'expanded'
  preserveStorageOnReload?: boolean
  appearance?: 'graphite' | 'light'
  state?: WorkspaceFixtureState
  knowledgePositions?: Record<string, KnowledgePosition>
  extraKnowledgeFiles?: number
  /** Optional absolute directory listings for folder-picker browser tests. */
  directoryListings?: Record<string, string[]>
  /** The manager agent's snapshot; absent keeps the manager hidden. */
  manager?: ManagerSnapshot
  /** Use a native event socket only on the already-validated local fixture origin. */
  nativeLocalEvents?: boolean
  realClock?: boolean
}

export interface WorkspaceFixtureState {
  roots: KnowledgeRoot[]
  sessions: ManagedSession[]
  /** Closed and still reopenable, newest first. */
  closedSessions: ManagedSession[]
  bindings: Map<string, SessionKnowledgeBinding>
  sessionOrder: SessionOrderSnapshot
  eventSockets: Set<WebSocketRoute>
  nextRootId: number
  settings: SettingsProfileRecord
}

const FIXTURE_SETTINGS_PROFILE_ID = 'fixture-settings'

export function createWorkspaceFixtureState(): WorkspaceFixtureState {
  const roots = structuredClone(fixtureKnowledgeRoots)
  const sessions = structuredClone(fixtureSessions)
  return {
    roots,
    sessions,
    closedSessions: [],
    bindings: new Map(sessions.map((session) => [
      `${session.computerId}:${session.id}`,
      {
        computerId: session.computerId,
        sessionId: session.id,
        rootId: KNOWLEDGE_ROOT_ID,
        rootPath: '.',
        root: roots[0],
        revision: 1,
        available: true,
      },
    ])),
    sessionOrder: {
      revision: 1,
      bootstrapped: true,
      showSuspended: true,
      showHidden: false,
      hidden: [],
      order: Object.fromEntries(
        fixtureComputers.map((computer) => [
          computer.id,
          sessions
            .filter((session) => session.computerId === computer.id)
            .map((session) => `${computer.id}:${session.id}`),
        ]),
      ),
    },
    eventSockets: new Set(),
    nextRootId: 1,
    settings: { revision: 0, values: {}, keyRevisions: {} },
  }
}

export interface WorkspaceFixture {
  url: string
  requests: Array<{ method: string; path: string }>
  sockets: string[]
  failures: string[]
  assertHealthy: () => void
  emit: (event: HubEvent) => void
}

// The only message the app sends on its event socket here: whether Oracle is on screen.
function isPresenceReport(message: string | Buffer): boolean {
  if (typeof message !== 'string') return false
  try {
    const report: unknown = JSON.parse(message)
    return (
      typeof report === 'object' &&
      report !== null &&
      Object.keys(report).length === 2 &&
      (report as { type?: unknown }).type === 'presence' &&
      typeof (report as { oracleVisible?: unknown }).oracleVisible === 'boolean'
    )
  } catch {
    return false
  }
}

function fixtureValue<T>(values: Record<string, T>, key: string): T | undefined {
  return Object.hasOwn(values, key) ? values[key] : undefined
}

export function fixtureBaseUrl(value: string): URL {
  const url = new URL(value)
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) ||
    !url.port ||
    ['4317', '4318'].includes(url.port) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'Use a loopback frontend-only origin with an explicit port, never 4317 or 4318.',
    )
  }
  return url
}

/**
 * Install before navigation in a fresh context with serviceWorkers: 'block'.
 * All domain traffic is synthetic; unknown HTTP requests and WebSockets fail closed.
 */
export async function setupWorkspaceFixture(
  page: Page,
  options: WorkspaceFixtureOptions,
): Promise<WorkspaceFixture> {
  const baseUrl = fixtureBaseUrl(options.baseUrl)
  const state = options.state ?? createWorkspaceFixtureState()
  const extraKnowledgeFiles = options.extraKnowledgeFiles ?? 0
  const directoryListings = options.directoryListings ?? {}
  if (!Number.isInteger(extraKnowledgeFiles) || extraKnowledgeFiles < 0 || extraKnowledgeFiles > 200) {
    throw new Error('Use between 0 and 200 synthetic extra Knowledge files.')
  }
  const sessions = state.sessions
  const selected = sessions.find(
    (session) => session.id === (options.selectedSessionId ?? SELECTED_SESSION_ID),
  )
  if (!selected) {
    throw new Error(`Unknown fixture session: ${options.selectedSessionId}`)
  }
  const requests: WorkspaceFixture['requests'] = []
  const sockets: string[] = []
  const failures: string[] = []
  const eventSockets = state.eventSockets
  const context = page.context()

  async function multipartFile(route: Route, field: string): Promise<File | undefined> {
    const request = route.request()
    const contentType = request.headers()['content-type'] ?? ''
    const body = request.postDataBuffer()
    if (!contentType.startsWith('multipart/form-data;') || !body) return undefined
    try {
      const form = await new Response(new Uint8Array(body), {
        headers: { 'content-type': contentType },
      }).formData()
      const file = form.get(field)
      if (file instanceof File && file.name && !/[\\/]/.test(file.name)) return file
    } catch {
      // Malformed multipart data falls through to the fail-closed response.
    }
    return undefined
  }

  page.on('pageerror', (error) => failures.push(`Page error: ${error.message}`))
  if (!options.realClock) await page.clock.setFixedTime(new Date(FIXTURE_NOW))
  await context.addInitScript(
    ({ origin, storage, preserveStorageOnReload }) => {
      if (location.origin !== origin) return
      const seeded = 'agentic-remote:workspace-fixture-seeded'
      if (preserveStorageOnReload && sessionStorage.getItem(seeded)) return
      localStorage.clear()
      sessionStorage.clear()
      for (const [key, value] of Object.entries(storage)) {
        localStorage.setItem(`agentic-remote:${key}`, JSON.stringify(value))
      }
      if (preserveStorageOnReload) sessionStorage.setItem(seeded, '1')
    },
    {
      origin: baseUrl.origin,
      preserveStorageOnReload: options.preserveStorageOnReload ?? false,
      storage: {
        appearance: options.appearance ?? 'graphite',
        'knowledge-mode': options.knowledgeMode ?? 'docked',
        'knowledge-root': KNOWLEDGE_ROOT_ID,
        'knowledge-roots-open': true,
        'knowledge-expanded': { [KNOWLEDGE_ROOT_ID]: ['handbook'] },
        'knowledge-session-positions': options.knowledgePositions ?? fixtureKnowledgePositions,
        'computer-order': fixtureComputers.map((computer) => computer.id),
        'session-order': Object.fromEntries(
          fixtureComputers.map((computer) => [
            computer.id,
            sessions
              .filter((session) => session.computerId === computer.id)
              .map((session) => `${computer.id}:${session.id}`),
          ]),
        ),
        'composer-drafts': {},
      },
    },
  )

  if (options.nativeLocalEvents) {
    await context.addInitScript(({ host }) => {
      const NativeSocket = window.WebSocket
      window.WebSocket = class extends NativeSocket {
        constructor(input: string | URL, protocols?: string | string[]) {
          const target = new URL(input, window.location.href)
          if (target.host !== host || target.pathname !== '/api/events' ||
            !['ws:', 'wss:'].includes(target.protocol) || target.username || target.password) {
            throw new Error('Blocked non-fixture native WebSocket')
          }
          super(input, protocols)
        }
      }
    }, { host: baseUrl.host })
  } else {
    await context.routeWebSocket('**/*', (socket) => {
      const url = new URL(socket.url())
      sockets.push(url.pathname)
      if (
        url.host !== baseUrl.host ||
        !['ws:', 'wss:'].includes(url.protocol)
      ) {
        failures.push(`Blocked external WebSocket: ${url.origin}${url.pathname}`)
        socket.close({ code: 1008, reason: 'Synthetic fixture only' })
        return
      }
      if (url.pathname === '/api/events') {
        eventSockets.add(socket)
        socket.onClose(() => eventSockets.delete(socket))
        socket.onMessage((message) => {
          if (!isPresenceReport(message)) {
            failures.push('Unexpected client message on fixture /api/events')
          }
        })
        return
      }
      if (url.pathname === '/' && url.searchParams.has('token')) {
        // Vite HMR is mocked too: never connectToServer(), even for the dev socket.
        socket.send(JSON.stringify({ type: 'connected' }))
        return
      }
      failures.push(`Unmocked WebSocket: ${url.pathname}`)
      socket.close({ code: 1008, reason: 'Unmocked fixture WebSocket' })
    })
  }

  async function reject(route: Route, reason: string) {
    failures.push(reason)
    await route.fulfill({
      status: 501,
      contentType: 'application/json',
      body: JSON.stringify({ error: reason }),
    })
  }

  await context.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()
    const path = url.pathname
    if (url.origin !== baseUrl.origin) {
      await reject(route, `Blocked external request: ${method} ${url.origin}${path}`)
      return
    }
    if (path !== '/api' && !path.startsWith('/api/')) {
      const asset =
        path === '/' ||
        /^\/(?:src|shared|node_modules|assets|icons|fonts)\//.test(path) ||
        /^\/@(?:vite|id|fs)\//.test(path) ||
        path === '/@react-refresh' ||
        /^\/(?:public\/)?(?:favicon\.ico|icon[^/]*\.(?:svg|png)|manifest\.webmanifest)$/.test(path)
      if (method !== 'GET' || !asset) {
        await reject(route, `Unmocked non-asset request: ${method} ${path}`)
        return
      }
      await route.continue()
      return
    }

    requests.push({ method, path: `${path}${url.search}` })
    const respond = async (body: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      })

    if (method === 'GET' && path === '/api/features') {
      await respond({ hubFlags: defaultHubFeatureFlags })
      return
    }
    if (method === 'GET' && path === '/api/computers') {
      await respond({ computers: fixtureComputers })
      return
    }
    if (method === 'GET' && path === '/api/manager') {
      await respond(options.manager ?? {
        available: false,
        unavailableReason: 'Not part of this fixture',
        status: 'offline',
        messages: [],
        queued: 0,
        managedSessions: [],
      })
      return
    }
    if (method === 'GET' && path === '/api/manager/dreamer') {
      await respond({
        available: true,
        revision: 0,
        settings: { enabled: false, timeZone: 'UTC' },
        tasks: [],
      } satisfies DreamerSnapshot)
      return
    }
    // The hub's settings profile under the hub's own rules, so the seeded
    // device settings are imported the way a current hub takes them.
    if (path === '/api/settings' || path === '/api/settings/import') {
      const snapshot = (): SettingsProfileSnapshot => ({
        profileId: FIXTURE_SETTINGS_PROFILE_ID,
        revision: state.settings.revision,
        values: structuredClone(state.settings.values),
      })
      // Like the hub, tells the open devices only when a commit changed something.
      const announce = (before: number) => {
        if (state.settings.revision !== before) emit({ type: 'settings.updated', settings: snapshot() })
      }
      try {
        if (method === 'GET' && path === '/api/settings') {
          await respond({ settings: snapshot() })
          return
        }
        if (method === 'POST' && path === '/api/settings/import') {
          const input = request.postDataJSON() as { deviceId?: string; values: Record<string, unknown> }
          const before = state.settings.revision
          state.settings = applySettingsImport(
            state.settings, validateSettingsImport(input.values), input.deviceId,
          )
          announce(before)
          await respond({ settings: snapshot() })
          return
        }
        if (method === 'PATCH' && path === '/api/settings') {
          const input = request.postDataJSON() as { deviceId?: string; changes: Record<string, unknown> }
          const before = state.settings.revision
          const result = applySettingsChanges(
            state.settings, validateSettingsChanges(input.changes), input.deviceId,
          )
          state.settings = result.record
          announce(before)
          await respond({ settings: snapshot(), conflicts: result.conflicts } satisfies SettingsUpdateResult)
          return
        }
      } catch (caught) {
        if (!(caught instanceof SettingsRequestError)) throw caught
        failures.push(`Refused settings request: ${caught.message}`)
        await respond({ error: caught.message }, caught.statusCode)
        return
      }
    }
    // A current hub with voice switched off, so Conversation mode stays hidden.
    if (method === 'GET' && path === '/api/oracle-voice/capabilities') {
      await respond({
        protocol: ORACLE_VOICE_PROTOCOL,
        available: false,
        computerId: 'fixture-hub',
        computerName: 'Hub',
        sampleRate: ORACLE_VOICE_SAMPLE_RATE,
        playbackSampleRate: ORACLE_VOICE_SAMPLE_RATE,
        languages: [],
        sttProfile: '',
        ttsVoice: '',
        resourceClass: 'low',
        limits: { maxFrameBytes: 32 * 1024, maxQueueBytes: 384_000, maxUtteranceMs: 30_000 },
        reason: 'Oracle voice is disabled (AGENTIC_REMOTE_ORACLE_VOICE=on to enable).',
      } satisfies VoiceCapabilities)
      return
    }
    if (method === 'GET' && path === '/api/sessions') {
      await respond({
        sessions,
        answeredComputerIds: fixtureComputers
          .filter((computer) => computer.online)
          .map((computer) => computer.id),
      })
      return
    }
    if (method === 'GET' && path === '/api/history') {
      await respond({ sessions })
      return
    }
    if (method === 'GET' && path === '/api/closed-sessions') {
      await respond({ sessions: state.closedSessions })
      return
    }
    if (method === 'GET' && path === '/api/session-order') {
      await respond({ sessionOrder: state.sessionOrder })
      return
    }
    // The hub's list visibility and hidden sessions, committed like its order.
    const commitSessionOrder = async (change: Partial<SessionOrderSnapshot>) => {
      state.sessionOrder = {
        ...state.sessionOrder,
        ...change,
        revision: state.sessionOrder.revision + 1,
      }
      emit({ type: 'session.order.updated', order: state.sessionOrder })
      await respond({ sessionOrder: state.sessionOrder })
    }
    if (method === 'PUT' && path === '/api/session-order') {
      const input = request.postDataJSON() as { showSuspended?: boolean; showHidden?: boolean }
      await commitSessionOrder({
        ...(input.showSuspended === undefined ? {} : { showSuspended: input.showSuspended }),
        ...(input.showHidden === undefined ? {} : { showHidden: input.showHidden }),
      })
      return
    }
    const sessionOrderEntry = path.match(/^\/api\/session-order\/([^/]+)\/([^/]+)$/)
    if (method === 'PUT' && sessionOrderEntry) {
      const input = request.postDataJSON() as { hidden: boolean }
      const key = `${decodeURIComponent(sessionOrderEntry[1])}:${decodeURIComponent(sessionOrderEntry[2])}`
      const others = (state.sessionOrder.hidden ?? []).filter((entry) => entry !== key)
      await commitSessionOrder({ hidden: input.hidden ? [...others, key] : others })
      return
    }
    const sessionOrderLane = path.match(/^\/api\/session-order\/([^/]+)$/)
    if (method === 'PUT' && sessionOrderLane) {
      const input = request.postDataJSON() as { order: string[] }
      const computerId = decodeURIComponent(sessionOrderLane[1])
      state.sessionOrder = {
        ...state.sessionOrder,
        revision: state.sessionOrder.revision + 1,
        order: {
          ...state.sessionOrder.order,
          [computerId]: [...input.order],
        },
      }
      emit({ type: 'session.order.updated', order: state.sessionOrder })
      await respond({ sessionOrder: state.sessionOrder })
      return
    }
    if (method === 'POST' && path === '/api/session-order/bootstrap') {
      const input = request.postDataJSON() as {
        order: Record<string, string[]>
      }
      if (!state.sessionOrder.bootstrapped) {
        state.sessionOrder = {
          ...state.sessionOrder,
          revision: state.sessionOrder.revision + 1,
          bootstrapped: true,
          showSuspended: state.sessionOrder.showSuspended,
          order: structuredClone(input.order),
        }
        emit({ type: 'session.order.updated', order: state.sessionOrder })
      }
      await respond({ sessionOrder: state.sessionOrder })
      return
    }
    if (method === 'GET' && path === '/api/push/settings') {
      await respond({ mutedSessions: [] })
      return
    }
    if (method === 'GET' && path === '/api/version') {
      await respond({ version: '1.1.0', buildId: '1.1.0' })
      return
    }
    if (method === 'POST' && path === '/api/transcriptions') {
      const file = await multipartFile(route, 'audio')
      if (!file || !file.type.startsWith('audio/')) {
        await reject(route, 'Unexpected fixture transcription')
        return
      }
      await respond({ transcript: 'Transcribed fixture note', durationSeconds: 2 })
      return
    }
    if (method === 'GET' && path === '/api/knowledge/roots') {
      await respond({ roots: state.roots })
      return
    }
    if (method === 'POST' && path === '/api/knowledge/roots') {
      const input = request.postDataJSON() as { computerId: string; path: string; name?: string }
      const owner = fixtureComputers.find((computer) => computer.id === input.computerId && computer.online)
      const allowed = input.path === '/home/demo' ||
        sessions.some((session) => session.computerId === input.computerId && session.cwd === input.path) ||
        state.roots.some((root) => root.computerId === input.computerId && root.path === input.path)
      if (!owner || !allowed) {
        await reject(route, 'Unexpected fixture Knowledge folder creation')
        return
      }
      let root = state.roots.find((root) => root.computerId === input.computerId && root.path === input.path)
      if (!root) {
        root = {
          id: `fixture-created-${state.nextRootId++}`,
          computerId: owner.id,
          computerName: owner.name,
          path: input.path,
          name: input.name || input.path.split('/').at(-1) || 'Workspace',
          createdAt: FIXTURE_NOW,
        }
        state.roots.push(root)
      }
      await respond({ root, listing: fixtureKnowledgeListings['.'] }, 201)
      return
    }
    const removedRoot = path.match(/^\/api\/knowledge\/roots\/([^/]+)$/)
    if (method === 'DELETE' && removedRoot) {
      const id = decodeURIComponent(removedRoot[1])
      if (!state.roots.some((root) => root.id === id)) {
        await respond({ error: 'Knowledge root not found' }, 404)
        return
      }
      state.roots = state.roots.filter((root) => root.id !== id)
      for (const binding of state.bindings.values()) {
        if (binding.rootId === id) emit({ type: 'session.knowledge.updated',
          computerId: binding.computerId, sessionId: binding.sessionId,
          binding: { ...binding, available: false } })
      }
      await route.fulfill({ status: 204 })
      return
    }
    const knowledge = path.match(/^\/api\/knowledge\/roots\/([^/]+)\/(entries|file)$/)
    if (method === 'GET' && knowledge && state.roots.some((root) => root.id === knowledge[1])) {
      const requestedPath = url.searchParams.get('path') ?? '.'
      const basePath = url.searchParams.get('basePath') ?? '.'
      const sourcePath = joinKnowledgeRelativePath(basePath, requestedPath)
      let body =
        knowledge[2] === 'entries'
          ? fixtureValue(fixtureKnowledgeListings, sourcePath)
          : fixtureValue(fixtureKnowledgeFiles, sourcePath)
      if (knowledge[2] === 'entries' && sourcePath === 'handbook' && extraKnowledgeFiles > 0) {
        body = {
          ...fixtureKnowledgeListings.handbook,
          entries: [
            ...fixtureKnowledgeListings.handbook.entries,
            ...Array.from({ length: extraKnowledgeFiles }, (_, index) => {
              const name = `design-note-${String(index + 1).padStart(3, '0')}.md`
              return { name, path: `handbook/${name}`, kind: 'markdown' as const }
            }),
          ],
        }
      }
      const extraFile = sourcePath.match(/^handbook\/design-note-(\d{3})\.md$/)
      if (knowledge[2] === 'file' && extraFile && Number(extraFile[1]) > 0 && Number(extraFile[1]) <= extraKnowledgeFiles) {
        const content = `# Design note ${Number(extraFile[1])}\n\nSynthetic content for checking long Knowledge trees.\n`
        body = {
          name: sourcePath.split('/').at(-1)!, path: sourcePath,
          kind: 'markdown', mimeType: 'text/markdown', content, size: Buffer.byteLength(content),
        }
      }
      if (body && knowledge[1] === SECOND_KNOWLEDGE_ROOT_ID && knowledge[2] === 'file') {
        const content = '# Build verification guide\n\n' +
          'This document lives in Build playbooks on Build node, not in Field notes on Studio.\n\n' +
          '## A separate reading context\n\nThe session keeps its own root, document, and draft.\n\n' +
          '## Before a release\n\n- Confirm the owning computer.\n- Keep a reversible checkpoint.\n- Record the result.\n'
        body = {
          name: sourcePath.split('/').at(-1)!,
          path: sourcePath,
          kind: 'markdown',
          mimeType: 'text/markdown',
          content,
          size: Buffer.byteLength(content),
        }
      }
      if (body) {
        if (basePath === '.') {
          await respond(body)
          return
        }
        if (knowledge[2] === 'entries') {
          const listing = body as WorkspaceListing
          const parent = listing.parent
            ? rebaseKnowledgeRelativePath(basePath, listing.parent)
            : undefined
          await respond({
            ...listing,
            path: rebaseKnowledgeRelativePath(basePath, listing.path),
            ...(parent === undefined ? { parent: undefined } : { parent }),
            entries: listing.entries.map((entry) => ({
              ...entry,
              path: rebaseKnowledgeRelativePath(basePath, entry.path),
            })),
          })
        } else {
          const file = body as WorkspaceFile
          await respond({
            ...file,
            path: rebaseKnowledgeRelativePath(basePath, file.path),
          })
        }
        return
      }
    }
    const directory = path.match(/^\/api\/computers\/([^/]+)\/directories$/)
    if (method === 'GET' && directory && fixtureComputers.some((computer) => computer.id === directory[1])) {
      const requested = url.searchParams.get('path')
      const current = !requested || requested === '~' ? '/home/demo' : requested
      const allowed = current === '/home/demo' ||
        sessions.some((session) => session.computerId === directory[1] && session.cwd === current) ||
        state.roots.some((root) => root.computerId === directory[1] && root.path === current) ||
        Object.hasOwn(directoryListings, current)
      if (!allowed) {
        await reject(route, `Unknown fixture directory ${current}`)
        return
      }
      const configured = directoryListings[current]
      await respond({
        path: current,
        parent: current === '/home/demo' ? undefined : '/home/demo',
        directories: configured
          ? configured.map((child) => ({
              name: child.split('/').at(-1),
              path: child,
            }))
          : current === '/home/demo'
          ? [...new Set(sessions.filter((session) => session.computerId === directory[1]).map((session) => session.cwd))]
            .map((path) => ({ name: path.split('/').at(-1), path }))
          : [],
      })
      return
    }
    const provider = path.match(
      /^\/api\/computers\/([^/]+)\/providers\/(copilot|claude)\/runtime$/,
    )
    if (
      method === 'GET' &&
      provider &&
      fixtureComputers.some(
        (computer) =>
          computer.id === provider[1] &&
          computer.providers?.some((entry) => entry.id === provider[2]),
      )
    ) {
      await respond({ models: fixtureModels })
      return
    }
    const match = path.match(
      /^\/api\/computers\/([^/]+)\/sessions\/([^/]+)(\/.*)?$/,
    )
    const session = match
      ? sessions.find((entry) => entry.computerId === match[1] && entry.id === match[2])
      : undefined
    // A closed session answers only to reopening and to deleting, as on a hub.
    const closedIndex = match
      ? state.closedSessions.findIndex((entry) => entry.computerId === match[1] && entry.id === match[2])
      : -1
    if (match && closedIndex >= 0) {
      const action = match[3] ?? ''
      if (method === 'POST' && action === '/open') {
        const [closed] = state.closedSessions.splice(closedIndex, 1)
        const { closedAt: _closedAt, closedContext: _closedContext, ...kept } = closed!
        const reopened: ManagedSession = { ...kept, isOpen: true }
        sessions.push(reopened)
        emit({ type: 'session.upserted', session: reopened })
        await respond({ session: reopened })
        return
      }
      if (method === 'DELETE' && action === '') {
        state.closedSessions.splice(closedIndex, 1)
        emit({ type: 'session.removed', computerId: match[1], sessionId: match[2] })
        await route.fulfill({ status: 204 })
        return
      }
    }
    if (session && match) {
      const action = match[3] ?? ''
      if (method === 'POST' && action === '/close') {
        const closed: ManagedSession = {
          ...session,
          isOpen: false,
          status: 'idle',
          messages: [],
          closedAt: options.realClock ? new Date().toISOString() : FIXTURE_NOW,
          closedContext: closedSessionContext(session),
        }
        sessions.splice(sessions.indexOf(session), 1)
        state.closedSessions.unshift(closed)
        emit({ type: 'session.removed', computerId: session.computerId, sessionId: session.id, closed: true })
        await respond({ session: closed })
        return
      }
      if (method === 'DELETE' && action === '') {
        sessions.splice(sessions.indexOf(session), 1)
        emit({ type: 'session.removed', computerId: session.computerId, sessionId: session.id })
        await route.fulfill({ status: 204 })
        return
      }
      const commitSession = () => {
        session.revision = (session.revision ?? 0) + 1
        session.updatedAt = FIXTURE_NOW
        emit({ type: 'session.upserted', session })
      }
      if (method === 'POST' && action === '/messages') {
        const input = request.postDataJSON() as { content?: unknown; enqueue?: unknown }
        if (typeof input.content !== 'string' || !input.content.trim() ||
          (input.enqueue !== undefined && typeof input.enqueue !== 'boolean')) {
          await reject(route, 'Unexpected fixture message')
          return
        }
        const id = `fixture-submission-${session.revision}`
        if (input.enqueue) {
          session.queuedPrompts = [...(session.queuedPrompts ?? []), { id, content: input.content, createdAt: FIXTURE_NOW }]
          session.queuedCount = session.queuedPrompts.length
        } else {
          session.messages.push({ id, role: 'user', content: input.content, createdAt: FIXTURE_NOW })
          session.status = 'running'
          session.activity = 'Working on the follow-up'
        }
        commitSession()
        await respond({ session })
        return
      }
      if (method === 'PUT' && action === '/queue') {
        const { order } = request.postDataJSON() as { order?: unknown }
        const prompts = session.queuedPrompts ?? []
        if (!Array.isArray(order) || order.length !== prompts.length ||
          new Set(order).size !== prompts.length ||
          order.some((id) => !prompts.some((prompt) => prompt.id === id))) {
          await reject(route, 'Unexpected fixture queue order')
          return
        }
        session.queuedPrompts = order.map((id) => prompts.find((prompt) => prompt.id === id)!)
        commitSession()
        await respond({ session })
        return
      }
      const queued = action.match(/^\/queue\/([^/]+)$/)
      if (method === 'PATCH' && queued) {
        const prompt = session.queuedPrompts?.find((prompt) => prompt.id === queued[1])
        const { content } = request.postDataJSON() as { content?: unknown }
        if (!prompt || typeof content !== 'string' || !content.trim()) {
          await reject(route, 'Unexpected fixture queue edit')
          return
        }
        prompt.content = content
        commitSession()
        await respond({ session, prompt })
        return
      }
      if (method === 'POST' && action === '/cancel') {
        session.status = 'idle'
        session.activity = undefined
        commitSession()
        await respond({ ok: true })
        return
      }
      if (method === 'PATCH' && action === '/runtime') {
        const input = request.postDataJSON() as {
          model: string; reasoningEffort: string; contextTier: string; mode: string
        }
        if (session.status !== 'idle' || input.model !== fixtureModels[0].id ||
          !fixtureModels[0].reasoningEfforts.some((effort) => effort === input.reasoningEffort) ||
          input.contextTier !== 'default' || !['interactive', 'plan', 'autopilot'].includes(input.mode)) {
          await reject(route, 'Unexpected fixture runtime change')
          return
        }
        session.runtime = { ...session.runtime, ...input }
        commitSession()
        await respond({ session })
        return
      }
      if (method === 'POST' && action === '/files') {
        const file = await multipartFile(route, 'file')
        if (!file) {
          await reject(route, 'Unexpected fixture file upload')
          return
        }
        await respond({
          file: { name: file.name, size: file.size, path: `${session.cwd}/.agentic-remote/uploads/${file.name}` },
        }, 201)
        return
      }
      if (action === '/knowledge-root' && (method === 'GET' || method === 'PUT')) {
        const key = `${session.computerId}:${session.id}`
        const saved = state.bindings.get(key) ?? {
          computerId: session.computerId, sessionId: session.id,
          rootId: null, rootPath: '.', revision: 0, available: false,
        }
        const current = {
          ...saved,
          rootPath: saved.rootPath || '.',
          available: state.roots.some((root) => root.id === saved.rootId),
        }
        if (method === 'GET') {
          await respond({ binding: current })
          return
        }
        const input = request.postDataJSON() as {
          rootId: string | null
          rootPath?: string
          expectedRevision: number
        }
        if (input.expectedRevision !== current.revision) {
          await respond({ error: 'The saved root changed in another client. Review it before retrying.', binding: current }, 409)
          return
        }
        const root = state.roots.find((root) => root.id === input.rootId)
        if (input.rootId !== null && !root) {
          await respond({ error: 'Knowledge root not found' }, 404)
          return
        }
        const binding: SessionKnowledgeBinding = {
          computerId: session.computerId, sessionId: session.id,
          rootId: input.rootId,
          rootPath: input.rootId ? input.rootPath || '.' : '.',
          revision: current.revision + 1,
          root,
          available: Boolean(root),
        }
        state.bindings.set(key, binding)
        emit({ type: 'session.knowledge.updated', computerId: session.computerId, sessionId: session.id, binding })
        await respond({ binding })
        return
      }
      if (
        (method === 'GET' && action === '') ||
        (method === 'POST' && action === '/open')
      ) {
        await respond({ session })
        return
      }
      if (method === 'GET' && action === '/commands') {
        await respond({
          commands: [
            {
              name: 'help',
              description: 'Show available session commands',
              allowDuringAgentExecution: true,
            },
          ],
        })
        return
      }
      if (method === 'GET' && action === '/runtime') {
        await respond({
          current: session.runtime,
          models: fixtureModels,
          status: session.status,
        })
        return
      }
      if (method === 'GET' && action === '/tasks') {
        await respond(
          fixtureBackgroundTasks[session.id] ?? {
            tasks: [],
            runningCount: 0,
            supported: session.provider === 'copilot',
          },
        )
        return
      }
      if (method === 'GET' && session.cwd === '/home/demo/field-notes') {
        const requestedPath = url.searchParams.get('path') ?? '.'
        const body =
          action === '/workspace'
            ? fixtureValue(fixtureKnowledgeListings, requestedPath)
            : action === '/workspace/file'
              ? fixtureValue(fixtureKnowledgeFiles, requestedPath)
              : undefined
        if (body) {
          await respond(body)
          return
        }
      }
    }
    await reject(route, `Unmocked API request: ${method} ${path}${url.search}`)
  })

  const url = new URL(baseUrl)
  url.searchParams.set('computer', selected.computerId)
  url.searchParams.set('session', selected.id)
  return {
    url: url.href,
    requests,
    sockets,
    failures,
    assertHealthy() {
      if (failures.length) throw new Error(failures.join('\n'))
    },
    emit,
  }

  function emit(event: HubEvent) {
    if (event.type === 'session.knowledge.updated') {
      state.bindings.set(`${event.computerId}:${event.sessionId}`, event.binding)
    }
    for (const socket of eventSockets) socket.send(JSON.stringify(event))
  }
}
