import type { Page, Route, WebSocketRoute } from '@playwright/test'
import type {
  BackgroundTaskSnapshot,
  ComputerSummary,
  HubEvent,
  KnowledgeRoot,
  ManagedSession,
  RuntimeModelOption,
  WorkspaceFile,
  WorkspaceListing,
} from '../shared/contracts'

export const FIXTURE_NOW = '2026-09-04T16:20:00.000Z'
export const SELECTED_SESSION_ID = 'fixture-plan-workspace'
export const PENDING_SESSION_ID = 'fixture-review-recovery'
export const PERMISSION_SESSION_ID = 'fixture-approve-check'
export const BACKGROUND_SESSION_ID = 'fixture-check-links'
export const IDLE_SESSION_ID = 'fixture-draft-summary'
export const SUSPENDED_SESSION_ID = 'fixture-sketch-handoff'
export const KNOWLEDGE_ROOT_ID = 'fixture-field-notes'
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
      },
      {
        id: 'claude',
        name: 'Claude Agent',
        available: true,
        terminalBacked: false,
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
      },
      {
        id: 'claude',
        name: 'Claude Agent',
        available: true,
        terminalBacked: false,
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
  'GET /api/computers',
  'GET /api/sessions',
  'GET /api/history',
  'GET /api/push/settings',
  'GET /api/version',
  'GET /api/knowledge/roots',
  'GET /api/knowledge/roots/:rootId/entries?path=.',
  'GET /api/knowledge/roots/:rootId/file?path=handbook/agent-workspace.md',
  'GET /api/computers/:computerId/providers/:provider/runtime',
  'GET /api/computers/:computerId/sessions/:sessionId',
  'GET /api/computers/:computerId/sessions/:sessionId/commands',
  'GET /api/computers/:computerId/sessions/:sessionId/runtime',
  'GET /api/computers/:computerId/sessions/:sessionId/tasks',
  'GET /api/computers/:computerId/sessions/:sessionId/workspace?path=.',
  'GET /api/computers/:computerId/sessions/:sessionId/workspace/file?path=handbook/agent-workspace.md',
  'POST /api/computers/:computerId/sessions/:sessionId/open',
  'WS /api/events',
] as const

export interface WorkspaceFixtureOptions {
  baseUrl: string
  selectedSessionId?: string
  knowledgeMode?: 'hidden' | 'docked' | 'expanded'
  preserveStorageOnReload?: boolean
}

export interface WorkspaceFixture {
  url: string
  requests: Array<{ method: string; path: string }>
  sockets: string[]
  failures: string[]
  assertHealthy: () => void
  emit: (event: HubEvent) => void
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
  const sessions = structuredClone(fixtureSessions)
  const selected = sessions.find(
    (session) => session.id === (options.selectedSessionId ?? SELECTED_SESSION_ID),
  )
  if (!selected) {
    throw new Error(`Unknown fixture session: ${options.selectedSessionId}`)
  }
  const requests: WorkspaceFixture['requests'] = []
  const sockets: string[] = []
  const failures: string[] = []
  const eventSockets = new Set<WebSocketRoute>()
  const context = page.context()

  page.on('pageerror', (error) => failures.push(`Page error: ${error.message}`))
  await page.clock.setFixedTime(new Date(FIXTURE_NOW))
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
        'knowledge-mode': options.knowledgeMode ?? 'docked',
        'knowledge-root': KNOWLEDGE_ROOT_ID,
        'knowledge-roots-open': true,
        'knowledge-expanded': { [KNOWLEDGE_ROOT_ID]: ['handbook'] },
        'knowledge-session-positions': fixtureKnowledgePositions,
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
      socket.onMessage(() => {
        failures.push('Unexpected client message on fixture /api/events')
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
        /^\/(?:src|shared|node_modules|assets|icons)\//.test(path) ||
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
    const respond = async (body: unknown) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      })

    if (method === 'GET' && path === '/api/computers') {
      await respond({ computers: fixtureComputers })
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
    if (method === 'GET' && path === '/api/push/settings') {
      await respond({ mutedSessions: [] })
      return
    }
    if (method === 'GET' && path === '/api/version') {
      await respond({ version: '0.35.0', buildId: '0.35.0' })
      return
    }
    if (method === 'GET' && path === '/api/knowledge/roots') {
      await respond({ roots: fixtureKnowledgeRoots })
      return
    }
    const knowledge = path.match(/^\/api\/knowledge\/roots\/([^/]+)\/(entries|file)$/)
    if (method === 'GET' && knowledge?.[1] === KNOWLEDGE_ROOT_ID) {
      const requestedPath = url.searchParams.get('path') ?? '.'
      const body =
        knowledge[2] === 'entries'
          ? fixtureValue(fixtureKnowledgeListings, requestedPath)
          : fixtureValue(fixtureKnowledgeFiles, requestedPath)
      if (body) {
        await respond(body)
        return
      }
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
    if (session && match) {
      const action = match[3] ?? ''
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
    emit(event) {
      for (const socket of eventSockets) socket.send(JSON.stringify(event))
    },
  }
}
