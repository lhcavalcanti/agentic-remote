import type { Page, Route, WebSocketRoute } from '@playwright/test'
import { defaultHubFeatureFlags, type HubFeatureFlags } from '../shared/feature-flags'
import { launchIdentitySchema } from '../shared/launch-identity'
import { skillToggleSchema, type SkillSettingsSnapshot } from '../shared/skill-settings'
import type { NotificationRecord } from '../shared/notification-center'
import { hostMetricNames, type HostSnapshot, type HostMinuteAggregate, type HostProcesses } from '../shared/host-telemetry'
import {
  scheduleActionSchema, scheduleAbandonSchema, SCHEDULE_ABANDONED_REASON, scheduleArchivedSchema, scheduleCreateSchema, scheduleEnabledSchema, scheduleListSchema,
  scheduleRevisionSchema, scheduleRunListSchema, scheduleSchema, scheduleUpdateSchema, type Schedule, type ScheduleRun,
} from '../shared/schedules'
import { validateRecurrence } from '../shared/schedule-recurrence'
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
import {
  SessionCategoryRefusal,
  applySessionCategoryChange,
  type SessionCategoriesSnapshot,
  type SessionCategoryChange,
} from '../shared/session-categories'
import type {
  ActivityDetail,
  AgentProvider,
  BackgroundTaskSnapshot,
  ChatMessage,
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
import { pageWholeSession, windowSession } from '../shared/transcript-window'

export const FIXTURE_NOW = '2026-09-04T16:20:00.000Z'
export const SELECTED_SESSION_ID = 'fixture-plan-workspace'
export const PENDING_SESSION_ID = 'fixture-review-recovery'
export const PERMISSION_SESSION_ID = 'fixture-approve-check'
export const BACKGROUND_SESSION_ID = 'fixture-check-links'
export const IDLE_SESSION_ID = 'fixture-draft-summary'
export const OFFLINE_SESSION_ID = 'fixture-sketch-handoff'
export const KNOWLEDGE_ROOT_ID = 'fixture-field-notes'
export const SECOND_KNOWLEDGE_ROOT_ID = 'fixture-build-playbooks'
export const KNOWLEDGE_FILE_PATH = 'handbook/agent-workspace.md'
export const KNOWLEDGE_DOCUMENT_TITLE = 'Agent workspace field guide'
export const CONTEXT_EXAMPLE = '{\n  "computer": "Studio",\n  "folder": "~/field-notes",\n  "mode": "plan"\n}\n'

export const fixtureHostSnapshot: HostSnapshot = {
  info: {
    hostname: 'studio-fictional', os: 'Linux', kernel: '6.8.0-fictional',
    cpuModel: 'Fictional 8-core CPU', logicalCpus: 16, totalMemoryBytes: 32 * 1024 ** 3,
    uptimeSeconds: 172_800, isWsl: false,
  },
  latest: null,
  live: Array.from({ length: 61 }, (_, index) => ({
    at: new Date(Date.parse(FIXTURE_NOW) - (60 - index) * 1000).toISOString(),
    cpuPercent: 18 + index % 12, memoryUsedBytes: 12 * 1024 ** 3 + index * 1024 ** 2,
    memoryAvailableBytes: 20 * 1024 ** 3 - index * 1024 ** 2, swapUsedBytes: 0,
    netRxBytesPerSec: 128_000 + index * 1024, netTxBytesPerSec: 64_000,
    diskReadBytesPerSec: 2 * 1024 ** 2, diskWriteBytesPerSec: 512 * 1024,
    load1: 1.8, load5: 1.5, load15: 1.2,
  })),
  disk: { mount: '/fictional-data', totalBytes: 512 * 1024 ** 3, freeBytes: 320 * 1024 ** 3 },
}
fixtureHostSnapshot.latest = fixtureHostSnapshot.live.at(-1)!

export const fixtureHostHistory: HostMinuteAggregate[] = Array.from({ length: 1440 }, (_, index) => ({
  at: new Date(Math.floor(Date.parse(FIXTURE_NOW) / 60_000) * 60_000 - (1439 - index) * 60_000).toISOString(),
  samples: 4,
  ...Object.fromEntries(hostMetricNames.map((metric) => {
    const value = fixtureHostSnapshot.latest![metric]
    return [metric, value === null ? null : { min: value * 0.9, avg: value, max: value * 1.1 }]
  })) as Pick<HostMinuteAggregate, typeof hostMetricNames[number]>,
}))

export const fixtureHostProcesses: HostProcesses = {
  scannedAt: FIXTURE_NOW, truncated: false, othersCount: 6,
  rows: [
    { pid: 2101, startTime: 123000, executable: 'node', cpuPercent: 1.2, rssBytes: 180 * 1024 ** 2, owner: 'agentic-remote' },
    { pid: 2130, startTime: 123100, executable: 'copilot', cpuPercent: 24, rssBytes: 420 * 1024 ** 2, owner: 'session', sessionId: SELECTED_SESSION_ID },
    { pid: 2150, startTime: 123200, executable: 'copilot-runtime', cpuPercent: 3.8, rssBytes: 256 * 1024 ** 2, owner: 'shared-runtime', label: 'Shared Copilot runtime' },
    { pid: 2200, startTime: 123300, executable: 'editor', cpuPercent: 0.5, rssBytes: 90 * 1024 ** 2, owner: 'other' },
  ],
}

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
        supportsSteering: true,
        supportsBackgroundTasks: true,
        supportsRecoverableClose: true,
      },
      {
        id: 'claude',
        name: 'Claude Agent',
        available: true,
        terminalBacked: false,
        supportsSteering: false,
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
        supportsSteering: true,
        supportsRecoverableClose: true,
      },
      {
        id: 'claude',
        name: 'Claude Agent',
        available: true,
        terminalBacked: false,
        supportsSteering: false,
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

export const fixtureSchedules: Schedule[] = [
  scheduleSchema.parse({
    id: 'fixture-morning-review', name: 'Morning field guide review',
    prompt: 'Review the fictional field guide and summarize outdated links.',
    target: { computerId: 'fixture-studio', folder: '/home/demo/field-notes', provider: 'copilot' },
    workspace: 'checkout', recurrence: { type: 'weekdays', time: '09:00' },
    catchUp: 'skip', overlap: 'queue', maxRuntimeMin: 30, notify: 'attention',
    enabled: true, archived: false, createdBy: 'user', revision: 1, createdAt: FIXTURE_NOW, updatedAt: FIXTURE_NOW,
  }),
]
export const fixtureScheduleRuns: ScheduleRun[] = [{
  id: 'fixture-schedule-run', scheduleId: 'fixture-morning-review', occurrenceAt: '2026-09-04T16:00:00.000Z',
  trigger: 'schedule', status: 'succeeded', launchId: 'fixture-review-launch', computerId: 'fixture-studio',
  sessionId: SELECTED_SESSION_ID, rootPromptReceipt: 'fixture-review-root',
  createdAt: '2026-09-04T16:00:00.000Z', startedAt: '2026-09-04T16:00:01.000Z',
  endedAt: '2026-09-04T16:04:00.000Z', summary: 'Reviewed the field guide links.',
}]

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
    id: OFFLINE_SESSION_ID,
    computerId: 'fixture-travel',
    computerName: 'Travel laptop',
    title: 'Sketch the next handoff',
    cwd: '/home/demo/notes',
    provider: 'copilot',
    executionMode: 'sdk',
    revision: 1,
    updatedAt: '2026-09-03T14:30:00.000Z',
    status: 'idle',
    isOpen: true,
    runtime,
    messages: [
      {
        id: 'fixture-handoff-assistant',
        role: 'assistant',
        content: 'This sketch is saved. Pick it up again when this computer is online.',
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

const fixtureLinkCheck = [
  '> field-notes@1.0.0 check-links',
  '> link-check docs/field-guide.md --format table',
  '',
  'Checking 18 links in docs/field-guide.md',
  '  ok   handbook/agent-workspace.md',
  '  ok   handbook/release-checklist.md',
  '  ok   handbook/reading-patterns.md',
  '  ok   reference/session-context.md',
  '  ok   reference/recovery-checklist.md#before-sharing',
  '  301  https://example.com/field-guide/old-reading-patterns -> https://example.com/field-guide/reading-patterns-for-long-documents',
  '  ok   https://example.com/field-guide/keyboard',
  '',
  'Checked 18 links: 17 ok, 1 redirected',
].join('\n')

const fixtureMcpArguments = { query: 'recovery checklist', perPage: 5 }

/**
 * Synthetic tool rows, each for a call its computer logged. Tests and the
 * tool-row scene add them to a session, so the shared scenes are unchanged.
 */
export const fixtureActivityMessages: ChatMessage[] = [
  {
    id: 'tool:fixture-call-read',
    role: 'activity',
    content: 'View\nhandbook/agent-workspace.md',
    createdAt: '2026-09-04T16:16:05.000Z',
    activityStatus: 'completed',
    activityKind: 'tool',
    activityResult: '24 lines',
    activityDurationMs: 80,
  },
  {
    id: 'tool:fixture-call-links',
    role: 'activity',
    content: 'Bash · Check the field guide links\n$ pnpm run check-links docs/field-guide.md --format table',
    createdAt: '2026-09-04T16:16:30.000Z',
    activityStatus: 'completed',
    activityKind: 'tool',
    activityResult: 'Checked 18 links: 17 ok, 1 redirected',
    activityDurationMs: 2_400,
  },
  {
    id: 'tool:fixture-call-missing',
    role: 'activity',
    content: 'View\nreference/old-checklist.md',
    createdAt: '2026-09-04T16:16:50.000Z',
    activityStatus: 'failed',
    activityKind: 'tool',
    activityResult: 'Error: reference/old-checklist.md does not exist',
    activityDurationMs: 40,
  },
  {
    id: 'tool:fixture-call-search',
    role: 'activity',
    content: `MCP · GitHub · Search Code\n${fixtureMcpArguments.query}`,
    createdAt: '2026-09-04T16:17:10.000Z',
    activityStatus: 'completed',
    activityKind: 'tool',
    activityResult: '3 results',
    activityDurationMs: 900,
  },
  {
    id: 'tool:fixture-call-edit',
    role: 'activity',
    content: 'Edit\nhandbook/release-checklist.md',
    createdAt: '2026-09-04T16:17:40.000Z',
    activityStatus: 'completed',
    activityKind: 'tool',
    activityResult: 'Updated the recovery section',
    activityDurationMs: 260,
  },
]

function fixtureText(text: string) {
  return { text, truncated: false, originalBytes: new TextEncoder().encode(text).length }
}

function fixtureArguments(value: object) {
  return { format: 'json' as const, ...fixtureText(JSON.stringify(value, null, 2)) }
}

/** What each synthetic call's computer logged, by `computerId:sessionId:toolCallId`. */
export const fixtureActivityDetails: Record<string, ActivityDetail> = {
  [`fixture-studio:${SELECTED_SESSION_ID}:fixture-call-read`]: {
    toolCallId: 'fixture-call-read',
    toolName: 'view',
    kind: 'tool',
    status: 'completed',
    startedAt: '2026-09-04T16:16:05.000Z',
    completedAt: '2026-09-04T16:16:05.080Z',
    durationMs: 80,
    arguments: fixtureArguments({ path: 'handbook/agent-workspace.md' }),
    result: fixtureText([
      '1. # Agent workspace field guide',
      '2. ',
      '3. A quiet place to supervise work, read a note, and decide what comes next.',
    ].join('\n')),
  },
  [`fixture-studio:${SELECTED_SESSION_ID}:fixture-call-links`]: {
    toolCallId: 'fixture-call-links',
    toolName: 'bash',
    kind: 'tool',
    status: 'completed',
    startedAt: '2026-09-04T16:16:30.000Z',
    completedAt: '2026-09-04T16:16:32.400Z',
    durationMs: 2_400,
    arguments: { format: 'command', ...fixtureText('pnpm run check-links docs/field-guide.md --format table') },
    result: fixtureText(fixtureLinkCheck),
  },
  [`fixture-studio:${SELECTED_SESSION_ID}:fixture-call-search`]: {
    toolCallId: 'fixture-call-search',
    toolName: 'search_code',
    mcpServerName: 'github-mcp-server',
    mcpToolName: 'search_code',
    kind: 'tool',
    status: 'completed',
    startedAt: '2026-09-04T16:17:10.000Z',
    completedAt: '2026-09-04T16:17:10.900Z',
    durationMs: 900,
    arguments: { format: 'json', ...fixtureText(JSON.stringify(fixtureMcpArguments, null, 2)) },
    result: fixtureText([
      '3 results for "recovery checklist"',
      'handbook/release-checklist.md:9',
      'reference/recovery-checklist.md:1',
      'handbook/agent-workspace.md:14',
    ].join('\n')),
  },
  [`fixture-studio:${SELECTED_SESSION_ID}:fixture-call-missing`]: {
    toolCallId: 'fixture-call-missing',
    toolName: 'view',
    kind: 'tool',
    status: 'failed',
    startedAt: '2026-09-04T16:16:50.000Z',
    completedAt: '2026-09-04T16:16:50.040Z',
    durationMs: 40,
    arguments: fixtureArguments({ path: 'reference/old-checklist.md' }),
    error: fixtureText('Path does not exist: reference/old-checklist.md'),
  },
  [`fixture-studio:${SELECTED_SESSION_ID}:fixture-call-edit`]: {
    toolCallId: 'fixture-call-edit',
    toolName: 'edit',
    kind: 'tool',
    status: 'completed',
    startedAt: '2026-09-04T16:17:40.000Z',
    completedAt: '2026-09-04T16:17:40.260Z',
    durationMs: 260,
    arguments: fixtureArguments({
      path: 'handbook/release-checklist.md',
      old_str: 'Keep the selected session, its draft, and its reading position together.',
      new_str: 'Keep the selected session, its draft, its open tool rows, and its reading position together.',
    }),
    result: fixtureText('File handbook/release-checklist.md updated with changes.'),
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
  'GET /api/notifications',
  'GET /api/notifications/unread-count',
  'POST /api/notifications/read-all',
  'POST /api/notifications/bulk',
  'POST /api/notifications/:id/read',
  'POST /api/notifications/:id/dismiss',
  'GET /api/schedules',
  'POST /api/schedules',
  'GET /api/schedules/:id',
  'PATCH /api/schedules/:id',
  'DELETE /api/schedules/:id',
  'POST /api/schedules/:id/enabled',
  'POST /api/schedules/:id/archived',
  'POST /api/schedules/:id/run',
  'GET /api/schedules/:id/runs',
  'GET /api/schedules/runs',
  'GET /api/schedules/runs/:id',
  'POST /api/schedules/runs/:id/stop',
  'POST /api/schedules/runs/:id/abandon',
  'GET /api/schedules/proposals',
  'POST /api/schedules/proposals/:id/approve',
  'POST /api/schedules/proposals/:id/reject',
  'GET /api/computers',
  'GET /api/computers/:computerId/host',
  'GET /api/computers/:computerId/host/history?range=24h',
  'GET /api/computers/:computerId/host/processes',
  'WS /api/computers/:computerId/host/live',
  'GET /api/sessions',
  'GET /api/history',
  'GET /api/closed-sessions',
  'GET /api/push/settings',
  'GET /api/version',
  'GET /api/diagnostics/health',
  'GET /api/computers/:computerId/skills',
  'PATCH /api/computers/:computerId/skills',
  'GET /api/knowledge/roots',
  'GET /api/knowledge/roots/:rootId/entries?path=.',
  'GET /api/knowledge/roots/:rootId/file?path=handbook/agent-workspace.md',
  'GET /api/computers/:computerId/directories?path=~&scope=all',
  'GET /api/computers/:computerId/providers/:provider/runtime',
  'POST /api/computers/:computerId/sessions',
  'GET /api/computers/:computerId/sessions/:sessionId',
  'GET /api/computers/:computerId/sessions/:sessionId/commands',
  'GET /api/computers/:computerId/sessions/:sessionId/runtime',
  'GET /api/computers/:computerId/sessions/:sessionId/tasks',
  'GET /api/computers/:computerId/sessions/:sessionId/activities/:toolCallId',
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
  /** Omitted keeps the hub notification center disabled, as in production. */
  notifications?: NotificationRecord[]
  /** Omitted keeps host monitoring off; all data is fictional. */
  hostMonitor?: boolean
  hostMonitorWsl?: boolean
  /** Omitted keeps the hub scheduler disabled. All data remains fictional. */
  scheduler?: { schedules: Schedule[]; runs: ScheduleRun[]; proposals?: import('../shared/schedule-proposals').ScheduleProposal[] }
  taskSnapshots?: Record<string, BackgroundTaskSnapshot>
  /** Tool call details by `computerId:sessionId:toolCallId`; an unknown call is not in the log. */
  activityDetails?: Record<string, ActivityDetail>
  /** Use a native event socket only on the already-validated local fixture origin. */
  nativeLocalEvents?: boolean
  /** List sessions as a hub lists its own: summaries, without their transcripts. */
  summaryListing?: boolean
  realClock?: boolean
}

export interface WorkspaceFixtureState {
  hubFlags: HubFeatureFlags
  models: RuntimeModelOption[]
  roots: KnowledgeRoot[]
  sessions: ManagedSession[]
  /** Closed and still reopenable, newest first. */
  closedSessions: ManagedSession[]
  bindings: Map<string, SessionKnowledgeBinding>
  sessionOrder: SessionOrderSnapshot
  /** The hub's categories, committed with the hub's own rules. */
  sessionCategories: SessionCategoriesSnapshot
  eventSockets: Set<WebSocketRoute>
  nextRootId: number
  settings: SettingsProfileRecord
}

const FIXTURE_SETTINGS_PROFILE_ID = 'fixture-settings'

export function createWorkspaceFixtureState(): WorkspaceFixtureState {
  const roots = structuredClone(fixtureKnowledgeRoots)
  const sessions = structuredClone(fixtureSessions)
  return {
    hubFlags: { ...defaultHubFeatureFlags },
    models: structuredClone(fixtureModels),
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
      showHidden: false,
      hidden: [],
      unread: [],
      order: Object.fromEntries(
        fixtureComputers.map((computer) => [
          computer.id,
          sessions
            .filter((session) => session.computerId === computer.id)
            .map((session) => `${computer.id}:${session.id}`),
        ]),
      ),
    },
    sessionCategories: { revision: 0, categories: [] },
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
  const computerSkills = new Map<string, SkillSettingsSnapshot>(fixtureComputers.map((computer) => [computer.id, {
    revision: 'a'.repeat(64), warnings: [],
    skills: [
      { name: 'review-notes', description: 'Review a fictional workspace checklist and summarize the next steps.',
        source: 'user', location: '~/.copilot/skills/review-notes', enabled: true },
      { name: 'release-check', description: 'Check the fictional release notes against the workspace plan.',
        source: 'repository', location: '~/field-notes/.github/skills/release-check', enabled: true },
      { name: 'draft-summary', description: 'Prepare a short handoff from the fictional review notes.',
        source: 'configured', location: '~/shared-skills/draft-summary', enabled: false },
      { name: 'invalid-checklist', description: '', source: 'repository', location: '~/field-notes/.agents/skills/invalid-checklist',
        enabled: false, manageable: false, reason: 'SKILL.md frontmatter description is required and must be at most 1024 characters.' },
    ],
  }]))
  const notifications = structuredClone(options.notifications ?? [])
  const scheduled = structuredClone(options.scheduler ?? { schedules: [], runs: [] })
  let scheduleRevision = 0
  let notificationRevision = 0
  const extraKnowledgeFiles = options.extraKnowledgeFiles ?? 0
  const directoryListings = options.directoryListings ?? {}
  if (!Number.isInteger(extraKnowledgeFiles) || extraKnowledgeFiles < 0 || extraKnowledgeFiles > 200) {
    throw new Error('Use between 0 and 200 synthetic extra Knowledge files.')
  }
  const sessions = state.sessions
  // Sessions this page starts, numbered so each has an id of its own.
  let startedSessions = 0
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
      const hostLive = /^\/api\/computers\/([^/]+)\/host\/live$/.exec(url.pathname)
      if (hostLive) {
        const computer = fixtureComputers.find(({ id }) => id === hostLive[1])
        if (!options.hostMonitor || !computer?.online) {
          socket.close({ code: 1008, reason: 'Host monitoring is unavailable in this fixture' })
          return
        }
        socket.send(JSON.stringify({
          type: 'host.snapshot',
          snapshot: { ...fixtureHostSnapshot, info: { ...fixtureHostSnapshot.info!, hostname: `${computer.id}-fictional`, isWsl: options.hostMonitorWsl ?? fixtureHostSnapshot.info!.isWsl } },
        }))
        socket.onMessage(() => {
          failures.push('Unexpected client message on fixture host stream')
          socket.close({ code: 1008, reason: 'Host monitoring is receive-only' })
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
      await respond({ hubFlags: {
        ...state.hubFlags,
        notificationCenter: state.hubFlags.notificationCenter || options.notifications !== undefined,
        hostMonitor: state.hubFlags.hostMonitor || options.hostMonitor === true,
        scheduler: state.hubFlags.scheduler || options.scheduler !== undefined,
      } })
      return
    }
    const skillRoute = /^\/api\/computers\/([^/]+)\/skills$/.exec(path)
    if (skillRoute && ['GET', 'PATCH'].includes(method)) {
      const computer = fixtureComputers.find((entry) => entry.id === skillRoute[1])
      const snapshot = computerSkills.get(skillRoute[1])
      if (!computer || !snapshot) { await respond({ error: 'Computer not found' }, 404); return }
      if (!computer.online) { await respond({ error: 'This computer is offline.' }, 503); return }
      if (method === 'GET') { await respond(snapshot); return }
      const parsed = skillToggleSchema.safeParse(request.postDataJSON())
      if (!parsed.success) { await respond({ error: 'Confirm the computer-wide CLI effect.' }, 400); return }
      if (parsed.data.revision !== snapshot.revision) { await respond({ error: 'CLI settings changed. Refresh and confirm again.' }, 409); return }
      if (!snapshot.skills.some((entry) => entry.name === parsed.data.name)) { await respond({ error: 'Skill not found' }, 404); return }
      const target = snapshot.skills.find((entry) => entry.name === parsed.data.name)!
      if (target.manageable === false) { await respond({ error: target.reason ?? 'This skill cannot be managed.' }, 409); return }
      const next = {
        ...snapshot, revision: (BigInt(`0x${snapshot.revision}`) + 1n).toString(16).padStart(64, '0'),
        skills: snapshot.skills.map((skill) => skill.name === parsed.data.name ? { ...skill, enabled: parsed.data.enabled } : skill),
      }
      computerSkills.set(computer.id, next)
      await respond(next)
      return
    }
    if (path === '/api/schedules' || path.startsWith('/api/schedules/')) {
      if (path === '/api/schedules/proposals' && method === 'GET') {
        await respond(options.scheduler ? { proposals: (scheduled.proposals ?? []).filter((entry) => entry.status === 'pending') }
          : { error: 'Scheduler is disabled' }, options.scheduler ? 200 : 404)
        return
      }
      if (/^\/api\/schedules\/proposals\/[^/]+\/(?:approve|reject)$/.test(path) && method === 'POST') {
        if (!options.scheduler) { await respond({ error: 'Scheduler is disabled' }, 404); return }
        const proposal = scheduled.proposals?.find((entry) => entry.id === path.split('/')[4])
        if (!proposal) { await respond({ error: 'Proposal not found' }, 404); return }
        if (proposal.status !== 'pending') { await respond({ error: 'Proposal is already resolved' }, 409); return }
        proposal.status = path.endsWith('/approve') ? 'applied' : 'rejected'
        emit({ type: 'schedule-proposals.changed', revision: ++scheduleRevision, proposalId: proposal.id })
        await respond({ proposal })
        return
      }
      // The single-segment GET matcher includes the reserved global /api/schedules/runs route.
      const known = (path === '/api/schedules' && ['GET', 'POST'].includes(method)) ||
        (/^\/api\/schedules\/[^/]+$/.test(path) && ['GET', 'PATCH', 'DELETE'].includes(method)) ||
        (/^\/api\/schedules\/[^/]+\/(?:enabled|archived|run)$/.test(path) && method === 'POST') ||
        (/^\/api\/schedules\/(?:[^/]+\/runs|runs\/[^/]+)$/.test(path) && method === 'GET') ||
        (/^\/api\/schedules\/runs\/[^/]+\/(?:stop|abandon)$/.test(path) && method === 'POST')
      if (!known) { await reject(route, `Unmocked schedule request: ${method} ${path}`); return }
      if (!options.scheduler) { await respond({ error: 'Scheduler is disabled' }, 404); return }
      const parts = path.split('/').slice(3)
      const changed = (scheduleId: string, runId?: string) =>
        emit({ type: 'schedules.changed', revision: ++scheduleRevision, scheduleId, ...(runId ? { runId } : {}) })
      const pageRuns = async (scheduleId?: string) => {
        const page = scheduleRunListSchema.parse(Object.fromEntries(url.searchParams))
        const runs = scheduled.runs.filter((run) => (!scheduleId || run.scheduleId === scheduleId) &&
          (!page.status || page.status === run.status)).slice().reverse()
        await respond({ runs: runs.slice(page.offset, page.offset + page.limit), total: runs.length,
          nextOffset: page.offset + page.limit < runs.length ? page.offset + page.limit : null })
      }
      try {
        const input = request.postDataJSON() ?? {}
        if (!parts.length) {
          if (method === 'GET') {
            const { archived } = scheduleListSchema.parse(Object.fromEntries(url.searchParams))
            await respond({ schedules: scheduled.schedules.filter((schedule) =>
              archived === undefined || schedule.archived === archived) })
            return
          }
          if (method === 'POST') {
            const parsed = scheduleCreateSchema.parse(input)
            if (!validateRecurrence(parsed.recurrence, parsed.timezone, new Date(FIXTURE_NOW)).valid) {
              await respond({ error: 'Invalid recurrence' }, 400); return
            }
            if (scheduled.schedules.some((schedule) => !schedule.archived && schedule.name.toLowerCase() === parsed.name.toLowerCase())) {
              await respond({ error: 'A non-archived schedule already has this name' }, 409); return
            }
            const schedule = scheduleSchema.parse({ ...parsed, id: `fixture-schedule-${++scheduleRevision}`,
              revision: 1, archived: false, createdBy: 'user', createdAt: FIXTURE_NOW, updatedAt: FIXTURE_NOW })
            scheduled.schedules.push(schedule)
            changed(schedule.id)
            await respond({ schedule }, 201); return
          }
        } else if (parts[0] === 'runs') {
          if (parts.length === 1 && method === 'GET') { await pageRuns(); return }
          const run = scheduled.runs.find((run) => run.id === parts[1])
          if (!run) { await respond({ error: 'Schedule run not found' }, 404); return }
          if (parts.length === 2 && method === 'GET') { await respond({ run }); return }
          if (parts.length === 3 && parts[2] === 'abandon' && method === 'POST') {
            scheduleAbandonSchema.parse(input)
            if (!run.abandonedAt) {
              if (!run.outcomeUnknown || !['pending', 'launching', 'running', 'needs-input', 'stopping'].includes(run.status)) {
                await respond({ error: 'Only a run with an unknown outcome can be abandoned' }, 409); return
              }
              run.status = 'interrupted'; run.abandonedAt = FIXTURE_NOW; run.endedAt = FIXTURE_NOW
              run.error = SCHEDULE_ABANDONED_REASON; changed(run.scheduleId, run.id)
            }
            await respond({ run }); return
          }
          if (parts.length === 3 && parts[2] === 'stop' && method === 'POST') {
            scheduleActionSchema.parse(input)
            if (['pending', 'launching', 'running', 'needs-input', 'stopping'].includes(run.status)) {
              run.status = 'stopped'; run.endedAt = FIXTURE_NOW; changed(run.scheduleId, run.id)
            }
            await respond({ run }); return
          }
        } else {
          const schedule = scheduled.schedules.find((schedule) => schedule.id === parts[0])
          if (!schedule) { await respond({ error: 'Schedule not found' }, 404); return }
          if (parts.length === 1 && method === 'GET') { await respond({ schedule }); return }
          if (parts.length === 2 && parts[1] === 'runs' && method === 'GET') { await pageRuns(schedule.id); return }
          if (parts.length === 2 && parts[1] === 'run' && method === 'POST') {
            scheduleActionSchema.parse(input)
            if (schedule.archived) { await respond({ error: 'Archived schedules cannot run' }, 409); return }
            const previous = scheduled.runs.filter((run) => run.scheduleId === schedule.id &&
              ['pending', 'launching', 'running', 'needs-input', 'stopping'].includes(run.status))
            if (schedule.overlap === 'replace') previous.forEach((run) => { run.status = 'stopped'; run.endedAt = FIXTURE_NOW })
            const id = `fixture-run-${++scheduleRevision}`
            const run: ScheduleRun = { id, scheduleId: schedule.id, computerId: schedule.target.computerId,
              occurrenceAt: FIXTURE_NOW, createdAt: FIXTURE_NOW, launchId: `${id}-launch`, trigger: 'manual',
              status: previous.length && schedule.overlap === 'skip' ? 'missed' : 'pending' }
            scheduled.runs.push(run); changed(schedule.id, run.id); await respond({ run }, 202); return
          }
          if ((parts.length === 1 && ['PATCH', 'DELETE'].includes(method)) ||
              (parts.length === 2 && ['enabled', 'archived'].includes(parts[1]) && method === 'POST')) {
            const mutation = method === 'PATCH' ? scheduleUpdateSchema.parse(input)
              : parts[1] === 'enabled' ? scheduleEnabledSchema.parse(input)
              : parts[1] === 'archived' ? scheduleArchivedSchema.parse(input) : scheduleRevisionSchema.parse(input)
            if (mutation.revision !== schedule.revision) { await respond({ error: 'Schedule revision conflict' }, 409); return }
            if (method === 'DELETE') {
              if (!schedule.archived || scheduled.runs.some((run) => run.scheduleId === schedule.id &&
                  ['pending', 'launching', 'running', 'needs-input', 'stopping'].includes(run.status))) {
                await respond({ error: 'Archive and resolve in-flight runs before deleting' }, 409); return
              }
              scheduled.schedules.splice(scheduled.schedules.indexOf(schedule), 1)
              scheduled.runs = scheduled.runs.filter((run) => run.scheduleId !== schedule.id)
              changed(schedule.id); await respond({ ok: true }); return
            }
            const candidate = { ...schedule, ...mutation, revision: schedule.revision + 1, updatedAt: FIXTURE_NOW }
            if (('recurrence' in mutation || 'timezone' in mutation) &&
                !validateRecurrence(candidate.recurrence, candidate.timezone, new Date(FIXTURE_NOW)).valid) {
              await respond({ error: 'Invalid recurrence' }, 400); return
            }
            if ('archived' in mutation && mutation.archived) candidate.enabled = false
            if ((candidate.archived && candidate.enabled) || scheduled.schedules.some((other) =>
              other.id !== candidate.id && !other.archived && !candidate.archived && other.name.toLowerCase() === candidate.name.toLowerCase())) {
              await respond({ error: 'Schedule state or name conflict' }, 409); return
            }
            Object.assign(schedule, candidate); changed(schedule.id); await respond({ schedule }); return
          }
        }
      } catch {
        await respond({ error: 'Invalid synthetic schedule request' }, 400); return
      }
      await reject(route, `Unmocked schedule request: ${method} ${path}`); return
    }
    if ((method === 'GET' && ['/api/notifications', '/api/notifications/unread-count'].includes(path)) ||
        (method === 'POST' && (['/api/notifications/read-all', '/api/notifications/bulk'].includes(path) || /^\/api\/notifications\/[a-f0-9]{64}\/(?:read|dismiss)$/.test(path)))) {
      if (options.notifications === undefined) {
        await respond({ error: 'Notification center is disabled' }, 404)
        return
      }
      const filtered = () => notifications.filter((record) =>
        !record.dismissedAt &&
        (!url.searchParams.has('unread') || !record.readAt === (url.searchParams.get('unread') === 'true')) &&
        (!url.searchParams.has('failed') || (record.severity === 'error') === (url.searchParams.get('failed') === 'true')) &&
        ['kind', 'sessionId', 'computerId'].every((key) =>
          !url.searchParams.has(key) || record[key as 'kind' | 'sessionId' | 'computerId'] === url.searchParams.get(key)),
      )
      if (method === 'GET') {
        await respond(path.endsWith('/unread-count')
          ? { unreadCount: filtered().filter((record) => !record.readAt).length }
          : { notifications: filtered() })
        return
      }
      if (path.endsWith('/bulk')) {
        const batch = route.request().postDataJSON() as { ids: string[]; action: 'read' | 'dismiss' }
        if (!Array.isArray(batch.ids) || !batch.ids.length || batch.ids.length > 1000 ||
            batch.ids.some((id) => !/^[a-f0-9]{64}$/.test(id)) || !['read', 'dismiss'].includes(batch.action)) {
          await respond({ error: 'Invalid notification batch' }, 400)
          return
        }
        notifications.filter((record) => batch.ids.includes(record.id)).forEach((record) => {
          if (batch.action === 'read') record.readAt ??= FIXTURE_NOW
          else record.dismissedAt ??= FIXTURE_NOW
        })
      } else if (path.endsWith('/read-all')) {
        filtered().forEach((record) => { record.readAt ??= FIXTURE_NOW })
      } else {
        const record = notifications.find((record) => record.id === path.split('/')[3])
        if (!record) {
          await respond({ error: 'Notification not found' }, 404)
          return
        }
        if (path.endsWith('/dismiss')) record.dismissedAt ??= FIXTURE_NOW
        else record.readAt ??= FIXTURE_NOW
      }
      emit({ type: 'notifications.changed', revision: ++notificationRevision,
        unreadCount: notifications.filter((record) => !record.readAt && !record.dismissedAt).length })
      await respond({ ok: true })
      return
    }
    if (method === 'GET' && path === '/api/computers') {
      await respond({ computers: fixtureComputers })
      return
    }
    const hostRoute = /^\/api\/computers\/([^/]+)\/host(?:\/(history|processes|live))?$/.exec(path)
    if (method === 'GET' && hostRoute) {
      const computer = fixtureComputers.find(({ id }) => id === hostRoute[1])
      if (!options.hostMonitor || !computer) {
        await respond({ error: 'Host monitoring not found' }, 404)
      } else if (!computer.online) {
        await respond({ error: 'This computer is unavailable' }, 503)
      } else if (hostRoute[2] === 'history') {
        const ranges = url.searchParams.getAll('range')
        const valid = ranges.length === 0 || (ranges.length === 1 && ranges[0] === '24h')
        await respond(valid ? fixtureHostHistory : { error: 'Host history range must be 24h' }, valid ? 200 : 400)
      } else if (hostRoute[2] === 'processes') {
        await respond(fixtureHostProcesses)
      } else if (hostRoute[2] === 'live') {
        await respond({ error: 'WebSocket upgrade required' }, 404)
      } else {
        await respond({ ...fixtureHostSnapshot, info: { ...fixtureHostSnapshot.info!, hostname: `${computer.id}-fictional`, isWsl: options.hostMonitorWsl ?? fixtureHostSnapshot.info!.isWsl } })
      }
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
          await respond({ settings: snapshot(), ...(url.searchParams.get('defaults') === 'displayName' ? { defaultDisplayName: 'Alex Morgan' } : {}) })
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
    // As the hub does for a browser that holds windows: a listing carries at
    // most a window of each transcript.
    const listed = () => {
      if (options.summaryListing) return sessions.map((session) => ({ ...session, messages: [] }))
      const window = Number(request.headers()['x-transcript-window'])
      return Number.isInteger(window) && window > 0
        ? sessions.map((session) => session.messages.length ? windowSession(session, window) : session)
        : sessions
    }
    if (method === 'GET' && path === '/api/sessions') {
      await respond({
        sessions: listed(),
        answeredComputerIds: fixtureComputers
          .filter((computer) => computer.online)
          .map((computer) => computer.id),
      })
      return
    }
    if (method === 'GET' && path === '/api/history') {
      await respond({ sessions: listed() })
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
    // The hub's list visibility, hidden and unread sessions, committed like its order.
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
      const input = request.postDataJSON() as { showHidden?: boolean }
      await commitSessionOrder({
        ...(input.showHidden === undefined ? {} : { showHidden: input.showHidden }),
      })
      return
    }
    const sessionOrderEntry = path.match(/^\/api\/session-order\/([^/]+)\/([^/]+)$/)
    if (method === 'PUT' && sessionOrderEntry) {
      const input = request.postDataJSON() as { hidden?: boolean; unread?: boolean }
      const key = `${decodeURIComponent(sessionOrderEntry[1])}:${decodeURIComponent(sessionOrderEntry[2])}`
      if (input.unread !== undefined) {
        const unread = (state.sessionOrder.unread ?? []).filter((entry) => entry !== key)
        await commitSessionOrder({ unread: input.unread ? [...unread, key] : unread })
        return
      }
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
          order: structuredClone(input.order),
        }
        emit({ type: 'session.order.updated', order: state.sessionOrder })
      }
      await respond({ sessionOrder: state.sessionOrder })
      return
    }
    if (method === 'GET' && path === '/api/session-categories') {
      await respond({ sessionCategories: state.sessionCategories })
      return
    }
    // As the hub does: a change made against another revision is refused, and
    // a committed one is told to every page sharing this state.
    const commitCategories = async (revision: number, change: SessionCategoryChange) => {
      if (revision !== state.sessionCategories.revision) {
        await respond({ error: 'Categories changed on another device; reload the session list and try again' }, 409)
        return
      }
      try {
        const categories = applySessionCategoryChange(state.sessionCategories.categories, change)
        if (categories !== state.sessionCategories.categories) {
          state.sessionCategories = { revision: revision + 1, categories }
          emit({ type: 'session.categories.updated', categories: state.sessionCategories })
        }
        await respond({ sessionCategories: state.sessionCategories })
      } catch (error) {
        if (!(error instanceof SessionCategoryRefusal)) throw error
        await respond({ error: error.message }, error.statusCode)
      }
    }
    const refs = (sessions: { computerId: string; sessionId: string }[] = []) =>
      sessions.map(({ computerId, sessionId }) => `${computerId}:${sessionId}`)
    if (method === 'POST' && path === '/api/session-categories') {
      const input = request.postDataJSON() as {
        revision: number; id: string; name: string; sessions?: { computerId: string; sessionId: string }[]
      }
      await commitCategories(input.revision, {
        type: 'create', id: input.id, name: input.name, sessions: refs(input.sessions),
      })
      return
    }
    if (method === 'POST' && path === '/api/session-categories/move') {
      const input = request.postDataJSON() as {
        revision: number; categoryId: string | null; index?: number; sessions: { computerId: string; sessionId: string }[]
      }
      await commitCategories(input.revision, {
        type: 'move',
        sessions: refs(input.sessions),
        categoryId: input.categoryId,
        ...(input.index === undefined ? {} : { index: input.index }),
      })
      return
    }
    const sessionCategory = path.match(/^\/api\/session-categories\/([^/]+)$/)
    if (method === 'PATCH' && sessionCategory) {
      const { revision, ...fields } = request.postDataJSON() as {
        revision: number; name?: string; collapsed?: boolean; index?: number
      }
      await commitCategories(revision, {
        type: 'update', categoryId: decodeURIComponent(sessionCategory[1]), ...fields,
      })
      return
    }
    if (method === 'DELETE' && sessionCategory) {
      await commitCategories(Number(url.searchParams.get('revision')), {
        type: 'delete', categoryId: decodeURIComponent(sessionCategory[1]),
      })
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
    if (method === 'GET' && path === '/api/diagnostics/health') {
      await respond({
        hub: { id: 'fixture-studio', name: 'Studio', role: 'hub', version: '1.54.0' },
        release: { version: '1.54.0', buildId: 'fixture-release-2026-09-04' },
        startup: [
          { startupPhase: 'app.build', event: 'complete', elapsedMs: 184, durationMs: 184 },
          { startupPhase: 'service.start', event: 'complete', elapsedMs: 426, durationMs: 242 },
          { startupPhase: 'fastify.listen', event: 'complete', elapsedMs: 432, durationMs: 6 },
        ],
        computers: fixtureComputers.map((computer) => ({
          id: computer.id, name: computer.name, role: computer.isLocal ? 'hub' : 'node',
          online: computer.online, version: computer.isLocal ? '1.54.0' : computer.online ? '1.53.0' : undefined,
        })),
        hubFlags: state.hubFlags,
      })
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
      await respond({ models: state.models })
      return
    }
    const launch = path.match(/^\/api\/computers\/([^/]+)\/launches\/([^/]+)$/)
    if (method === 'GET' && launch && fixtureComputers.some((computer) => computer.id === launch[1])) {
      const owned = sessions.find((entry) => entry.computerId === launch[1] && entry.launchId === decodeURIComponent(launch[2]))
      await respond({ launch: owned ? {
        launchId: owned.launchId, sessionId: owned.id, sessionStatus: owned.status, receipts: owned.promptReceipts || [],
      } : null })
      return
    }
    // As the hub does: a session it starts is named after its folder, and
    // is last under its computer before the hub answers.
    const creation = path.match(/^\/api\/computers\/([^/]+)\/sessions$/)
    if (method === 'POST' && creation) {
      const owner = fixtureComputers.find((computer) => computer.id === decodeURIComponent(creation[1]!) && computer.online)
      const input = request.postDataJSON() as { cwd?: unknown; provider?: AgentProvider; terminalBacked?: boolean }
      if (!owner || typeof input.cwd !== 'string' || !input.cwd.startsWith('/home/demo')) {
        await reject(route, 'Unexpected fixture session creation')
        return
      }
      const started: ManagedSession = {
        id: `fixture-started-${++startedSessions}`,
        computerId: owner.id,
        computerName: owner.name,
        title: input.cwd.split('/').at(-1) || 'New session',
        cwd: input.cwd,
        provider: input.provider ?? 'copilot',
        executionMode: input.terminalBacked ? 'tmux' : 'sdk',
        revision: 1,
        updatedAt: options.realClock ? new Date().toISOString() : FIXTURE_NOW,
        status: 'idle',
        isOpen: true,
        messages: [],
      }
      sessions.push(started)
      state.sessionOrder = {
        ...state.sessionOrder,
        revision: state.sessionOrder.revision + 1,
        order: {
          ...state.sessionOrder.order,
          [owner.id]: [...(state.sessionOrder.order[owner.id] ?? []), `${owner.id}:${started.id}`],
        },
      }
      emit({ type: 'session.upserted', session: started })
      emit({ type: 'session.order.updated', order: state.sessionOrder })
      await respond({ session: started }, 201)
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
      if (method === 'POST' && action === '/commands') {
        const input = request.postDataJSON() as { command?: unknown; enqueue?: unknown; replaceTerminalDraft?: unknown }
        if (typeof input.command !== 'string' || !/^\/help(?:\s|$)/.test(input.command.trim()) ||
          input.command.trim().length > 10_000 ||
          (input.enqueue !== undefined && typeof input.enqueue !== 'boolean') ||
          (input.replaceTerminalDraft !== undefined && typeof input.replaceTerminalDraft !== 'boolean')) {
          await reject(route, 'Unexpected fixture command')
          return
        }
        const content = input.command.trim()
        const id = `fixture-command-${session.revision}`
        if (input.enqueue) {
          session.queuedPrompts = [...(session.queuedPrompts ?? []), { id, content, createdAt: FIXTURE_NOW }]
          session.queuedCount = session.queuedPrompts.length
        } else {
          session.messages.push({ id, role: 'user', content, createdAt: FIXTURE_NOW })
        }
        commitSession()
        await respond({ session })
        return
      }
      if (method === 'POST' && action === '/messages') {
        const input = request.postDataJSON() as { content?: unknown; enqueue?: unknown; deliveryId?: unknown }
        if (typeof input.content !== 'string' || !input.content.trim() ||
          (input.enqueue !== undefined && typeof input.enqueue !== 'boolean') ||
          (input.deliveryId !== undefined && !launchIdentitySchema.safeParse(input.deliveryId).success)) {
          await reject(route, 'Unexpected fixture message')
          return
        }
        const deliveryId = typeof input.deliveryId === 'string' ? input.deliveryId : undefined
        if (deliveryId !== undefined) {
          const owner = sessions.find((entry) => entry.computerId === session.computerId &&
            entry.promptReceipts?.some((receipt) => receipt.deliveryId === deliveryId))
          if (owner && owner.id !== session.id) {
            await respond({ error: 'Delivery identity belongs to another session.' }, 409)
            return
          }
          const receipt = session.promptReceipts?.find((entry) => entry.deliveryId === deliveryId)
          if (receipt) {
            await respond({ session, receipt })
            return
          }
          if (session.launchStopping || (!input.enqueue && (session.status === 'running' || session.status === 'waiting'))) {
            await respond({ error: 'This session cannot accept a new prompt now.' }, 409)
            return
          }
        }
        const id = `fixture-submission-${session.revision}`
        if (input.enqueue || deliveryId !== undefined) {
          session.queuedPrompts = [...(session.queuedPrompts ?? []), { id, content: input.content, createdAt: FIXTURE_NOW }]
          session.queuedCount = session.queuedPrompts.length
        } else {
          session.messages.push({ id, role: 'user', deliveryConfirmed: true, content: input.content, createdAt: FIXTURE_NOW })
          session.status = 'running'
          session.activity = 'Working on the follow-up'
        }
        if (deliveryId !== undefined) {
          session.promptReceipts = [...(session.promptReceipts ?? []), {
            deliveryId, sessionId: session.id, promptId: id, acceptedAt: FIXTURE_NOW, state: 'queued',
          }]
        }
        commitSession()
        await respond({
          session,
          ...(deliveryId !== undefined ? { receipt: session.promptReceipts!.find((receipt) => receipt.deliveryId === deliveryId) } : {}),
        })
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
        const model = state.models.find((model) => model.id === input.model)
        if (session.status !== 'idle' || !model ||
          !model.reasoningEfforts.some((effort) => effort === input.reasoningEffort) ||
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
      if (method === 'POST' && action === '/cancel-with-ack') {
        await respond({
          sessionId: session.id, outcome: 'unknown', checkedAt: session.updatedAt, scope: 'provider-owned',
          reason: 'Synthetic fixture has no provider termination signal.',
        })
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
      if (method === 'GET' && action === '') {
        // As the hub does: a read that asks for a window gets one.
        const window = Number(url.searchParams.get('window'))
        await respond({ session: windowSession(session, Number.isInteger(window) && window > 0 ? window : undefined) })
        return
      }
      if (method === 'POST' && action === '/open') {
        await respond({ session })
        return
      }
      if (method === 'GET' && action === '/messages') {
        try {
          await respond(pageWholeSession(session, {
            before: Number(url.searchParams.get('before')),
            beforeId: url.searchParams.get('beforeId') ?? '',
            limit: Number(url.searchParams.get('limit')),
          }))
        } catch (error) {
          await respond({ error: (error as Error).message }, (error as { statusCode?: number }).statusCode ?? 500)
        }
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
          models: state.models,
          status: session.status,
        })
        return
      }
      if (method === 'GET' && action === '/tasks') {
        await respond(
          options.taskSnapshots?.[`${session.computerId}:${session.id}`] ?? fixtureBackgroundTasks[session.id] ?? {
            tasks: [],
            runningCount: 0,
            supported: session.provider === 'copilot',
          },
        )
        return
      }
      const activity = action.match(/^\/activities\/([^/]+)$/)
      if (method === 'GET' && activity) {
        if (session.provider === 'claude') {
          await respond({ error: 'Tool call details are unavailable for this provider.' }, 501)
          return
        }
        const detail = options.activityDetails?.[`${session.computerId}:${session.id}:${decodeURIComponent(activity[1]!)}`]
        await respond(detail ?? { error: 'This tool call is not in the session log.' }, detail ? 200 : 404)
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
    if (event.type === 'schedule.run.notification') {
      if (!options.scheduler) throw new Error('A disabled scheduler cannot publish an outcome')
      if (options.notifications !== undefined && !notifications.some((record) => record.id === event.notification.id)) {
        notifications.push(structuredClone(event.notification))
        emit({ type: 'notifications.changed', revision: ++notificationRevision,
          unreadCount: notifications.filter((record) => !record.readAt && !record.dismissedAt).length })
      }
    }
    if (event.type === 'session.knowledge.updated') {
      state.bindings.set(`${event.computerId}:${event.sessionId}`, event.binding)
    }
    for (const socket of eventSockets) socket.send(JSON.stringify(event))
  }
}
