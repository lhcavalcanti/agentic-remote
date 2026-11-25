import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComputerSummary, ManagedSession, RuntimeModelOption } from '../shared/contracts.js'
import type { ManagerMessageSource, ManagerSessionBackend } from '../shared/manager.js'
import type { SessionCategoriesSnapshot, SessionCategory } from '../shared/session-categories.js'
import type { NewSessionRuntimesSetting } from '../shared/settings-profile.js'
import { ManagerMemory } from './manager-memory.js'
import { ManagerStructuredMemoryStore } from './manager-structured-memory-store.js'
import {
  createManagerTools,
  type ManagerTool,
  type ManagerToolActivity,
  type ManagerToolHost,
} from './manager-tools.js'
import * as managerToolsModule from './manager-tools.js'
import { SchedulerStore } from './scheduler-store.js'
import { sessionCategoryWriter, type SessionCategoryWriter } from './session-category-routes.js'
import { SessionCategoryStore } from './session-category-store.js'
import { SessionOrderStore } from './session-order-store.js'

const computers: ComputerSummary[] = [
  {
    id: 'hub', name: 'development', isLocal: true, online: true,
    providers: [
      { id: 'copilot', name: 'GitHub Copilot', available: true, terminalBacked: true, supportsSideQuestions: true },
      { id: 'claude', name: 'Claude Agent', available: true, terminalBacked: false },
    ],
  },
  { id: 'node', name: 'production', isLocal: false, online: false, providers: [] },
]

// Neutral synthetic catalogs: real ids come from each provider's discovery.
const copilotModels: RuntimeModelOption[] = [
  { id: 'model-a', name: 'Model A', reasoningEfforts: ['low', 'high'], contextTiers: ['default'] },
  { id: 'model-b', name: 'model-b', reasoningEfforts: [], contextTiers: ['default', 'long_context'] },
]
const claudeModels: RuntimeModelOption[] = [
  { id: 'claude-agent-model', name: 'Claude Agent model', reasoningEfforts: [], contextTiers: ['default'] },
]

function session(id: string, change: Partial<ManagedSession> = {}): ManagedSession {
  return {
    id, computerId: 'hub', computerName: 'development', cwd: '/home/me/src/app',
    title: `Session ${id}`, status: 'idle', updatedAt: '2026-10-15T11:55:00.000Z',
    isOpen: true, provider: 'copilot', messages: [], ...change,
  }
}

describe('manager tools', () => {
  let root: string
  let host: ManagerToolHost & { [key: string]: unknown }
  let activities: ManagerToolActivity[]
  let tools: Map<string, ManagerTool>
  let answerOnly: boolean
  let source: ManagerMessageSource
  let proactiveSessionIds: Set<string>
  let taskSessionIds: Set<string>
  let oracleFolders: Record<string, string>
  let backend: ManagerSessionBackend
  let runtimes: NewSessionRuntimesSetting

  const call = async (name: string, args: unknown, toolCallId = 't') => {
    const tool = tools.get(name)
    if (!tool) throw new Error(`no tool ${name}`)
    return tool.handler(args, { sessionId: 'manager', toolCallId, toolName: name, arguments: args })
  }

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'manager-tools-'))
    activities = []
    answerOnly = false
    source = 'typed'
    proactiveSessionIds = new Set()
    taskSessionIds = new Set()
    oracleFolders = {}
    backend = 'sdk'
    runtimes = { copilot: { model: 'model-a', reasoningEffort: '', contextTier: 'default', mode: 'autopilot' } }
    const created = session('new1', { cwd: '/home/me/src/web', runtime: { model: 'model-a' } })
    host = {
      computers: () => computers,
      findComputer: (nameOrId) => computers.find((computer) => computer.id === nameOrId || computer.name === nameOrId),
      listSessions: vi.fn(async () => [session('abc12345-aaaa'), session('def67890-bbbb', { status: 'running' })]),
      listHistory: vi.fn(async () => [session('old99999-cccc', { isOpen: false })]),
      listClosedSessions: vi.fn(async () => [session('old99999-cccc', {
        isOpen: false,
        title: 'Migration plan',
        closedAt: '2026-10-14T09:00:00.000Z',
        closedContext: {
          title: 'Migration plan',
          cwd: '/home/me/src/app',
          prompts: ['Draft the database migration plan', 'Add a rollback <step>'],
          reply: 'The plan has "three" phases.',
        },
      })]),
      readSession: vi.fn(async (_computerId: string, id: string) => session(id, {
        messages: Array.from({ length: 12 }, (_, index) => ({
          id: `${index}`, role: index % 2 ? 'assistant' : 'user', content: `message ${index} ${'x'.repeat(index === 11 ? 3000 : 1)}`, createdAt: 't',
        })),
      })),
      askSession: vi.fn(async () => 'It fixed the bug and opened PR #12.'),
      createSession: vi.fn(async () => created),
      providerModels: vi.fn(async (_computerId: string, provider: string) =>
        provider === 'claude' ? claudeModels : copilotModels),
      renameSession: vi.fn(async (_computerId: string, id: string, title: string) => session(id, { title })),
      sendMessage: vi.fn(async (_computerId: string, id: string) => session(id)),
      replyPermission: vi.fn(async (_computerId: string, id: string) => session(id)),
      replyUserInput: vi.fn(async (_computerId: string, id: string) => session(id)),
      reopenSession: vi.fn(async (_computerId: string, id: string) => session(id)),
      cancel: vi.fn(async () => undefined),
      requestCloseConfirmation: vi.fn(async () => undefined),
      discoverSkills: vi.fn(async () => [{ name: 'brainstorming', description: 'Explore intent before building', source: 'personal' }]),
      markManaged: vi.fn(async () => undefined),
      registry: () => ({}),
      answerOnly: () => answerOnly,
      messageSource: () => source,
      proactiveSessionRefs: () => [...proactiveSessionIds].map((sessionId) => ({
        computerId: 'hub',
        sessionId,
      })),
      taskSessionRefs: () => [...taskSessionIds].map((sessionId) => ({
        computerId: 'hub',
        sessionId,
      })),
      recordProactiveOutcomes: vi.fn(async () => 'Recorded 1 proactive outcome.'),
      sessionFolders: () => oracleFolders,
      setSessionFolder: vi.fn(async (computerId: string, folder?: string) => {
        if (folder === '~/missing') throw new Error('Folder does not exist')
        const normalized = folder?.replace(/^~/, '/home/me')
        if (normalized) oracleFolders = { ...oracleFolders, [computerId]: normalized }
        else oracleFolders = Object.fromEntries(Object.entries(oracleFolders).filter(([id]) => id !== computerId))
        return normalized
      }),
      sessionBackend: () => backend,
      setSessionBackend: vi.fn(async (next: ManagerSessionBackend) => {
        backend = next
        return next
      }),
      memory: new ManagerMemory(path.join(root, 'memory')),
      configuredRuntime: (provider) => runtimes[provider],
      defaults: () => ({ computerId: 'hub', folders: { hub: '~/src/web' } }),
      now: () => new Date('2026-10-15T12:00:00.000Z'),
    }
    tools = new Map(createManagerTools(host, (activity) => {
      activities.push(activity)
      if (source === 'task') {
        for (const reference of activity.sessionRefs ?? []) {
          taskSessionIds.add(reference.sessionId)
        }
      }
    }, { pollMs: 1, trustWaitMs: 40 })
      .map((tool) => [tool.name, tool]))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  async function enableSchedulerTools() {
    const store = new SchedulerStore(root, { now: () => Date.parse('2026-11-14T18:00:00Z') })
    await store.initialize()
    host.scheduler = () => store
    tools = new Map(createManagerTools(host, (entry) => activities.push(entry)).map((tool) => [tool.name, tool]))
    return store
  }

  const scheduleInput = () => ({
    name: 'Fictional review', prompt: 'Review the fictional guide.',
    target: { computerId: 'hub', folder: '/fictional/repo', provider: 'copilot' as const },
    recurrence: { type: 'daily' as const, time: '09:00' }, timezone: 'UTC',
  })

  it.each([
    ['typed', true], ['voice', false], ['proactive', false], ['task', false],
  ] as const)('refuses every schedule write in %s turns with Ask=%s', async (kind, ask) => {
    const store = await enableSchedulerTools()
    source = kind
    answerOnly = ask
    for (const name of ['create_schedule', 'update_schedule', 'set_schedule_enabled', 'run_schedule_now', 'archive_schedule']) {
      expect(await call(name, {}), name).toMatchObject({ resultType: 'failure' })
    }
    expect(store.proposals()).toEqual([])
    expect(store.list()).toEqual([])
    expect(host.createSession).not.toHaveBeenCalled()
  })

  it('only proposes each Delegate schedule write and never mutates schedules or admits runs', async () => {
    const store = await enableSchedulerTools()
    const schedule = await store.create(scheduleInput())
    const identity = { scheduleId: schedule.id, revision: 1 }
    for (const [name, args, operation] of [
      ['create_schedule', { ...scheduleInput(), name: 'New fictional review' }, 'create'],
      ['update_schedule', { ...identity, changes: { prompt: 'Changed prompt' } }, 'update'],
      ['set_schedule_enabled', { ...identity, enabled: true }, 'enable'],
      ['set_schedule_enabled', { ...identity, enabled: false }, 'disable'],
      ['run_schedule_now', identity, 'run-now'],
      ['archive_schedule', identity, 'archive'],
    ] as const) {
      const result = JSON.parse(await call(name, args) as string)
      expect(result).toMatchObject({ approvalRequired: true, status: 'pending', summary: expect.any(String) })
      expect(store.proposal(result.proposalId).operation).toBe(operation)
    }
    expect(store.list()).toEqual([schedule])
    expect(store.allRuns()).toEqual([])
    expect(activities).toHaveLength(6)
    expect(tools.has('delete_schedule')).toBe(false)
  })

  it.each(['typed', 'voice', 'proactive', 'task'] as const)('allows bounded schedule reads in %s and Ask mode', async (kind) => {
    const store = await enableSchedulerTools()
    const schedule = await store.create(scheduleInput())
    source = kind
    answerOnly = true
    expect(JSON.parse(await call('list_schedules', {}) as string).schedules).toHaveLength(1)
    expect(JSON.parse(await call('get_schedule', { scheduleId: schedule.id }) as string).id).toBe(schedule.id)
    expect(JSON.parse(await call('list_schedule_runs', { scheduleId: schedule.id, limit: 1 }) as string).runs).toEqual([])
    expect(await call('list_schedule_runs', { limit: 201 })).toMatchObject({ resultType: 'failure' })
    expect(store.proposals()).toEqual([])
  })

  it('bounds schedule and run list output while preserving exact single-schedule details', async () => {
    const store = await enableSchedulerTools()
    const schedule = await store.create({ ...scheduleInput(), prompt: 'P'.repeat(20_000) })
    vi.spyOn(store, 'list').mockReturnValue(Array.from({ length: 100 }, (_, index) => ({ ...schedule, id: `schedule-${index}` })))
    const listed = await call('list_schedules', {}) as string
    expect(listed.length).toBeLessThan(13_000)
    expect(listed).not.toContain('P'.repeat(100))
    expect(JSON.parse(listed)).toMatchObject({ total: 100, nextOffset: 20, notice: expect.stringContaining('80 records not shown') })
    expect(JSON.parse(await call('get_schedule', { scheduleId: schedule.id }) as string).prompt).toBe(schedule.prompt)
    const run = (await store.admit(schedule.id, '2026-11-14T18:00:00Z', 'manual'))!
    vi.spyOn(store, 'listRuns').mockReturnValue({
      runs: Array.from({ length: 20 }, () => ({ ...run, summary: 'S'.repeat(20_000), error: 'E'.repeat(20_000) })),
      total: 200, nextOffset: 20,
    })
    const runs = await call('list_schedule_runs', { limit: 200 }) as string
    expect(runs.length).toBeLessThan(13_000)
    expect(runs).not.toContain('S'.repeat(281))
    expect(JSON.parse(runs).notice).toContain('records not shown')
  })

  it('offers only management tools, none of which prompt for permission', () => {
    expect([...tools.keys()].sort()).toEqual([
      'answer_session', 'ask_session', 'cancel_session', 'close_session', 'create_session', 'get_session',
      'list_closed_sessions', 'list_computers', 'list_models', 'list_sessions', 'list_skills', 'memory_append',
      'memory_delete', 'memory_list', 'memory_read', 'memory_write', 'record_proactive_outcomes',
      'rename_session', 'reopen_session', 'send_to_session', 'set_session_backend',
      'set_session_folder',
    ])
    for (const tool of tools.values()) {
      expect(tool.skipPermission).toBe(true)
      expect(tool.parameters).toMatchObject({ type: 'object' })
      expect(tool.description?.length).toBeGreaterThan(20)
    }
  })

  it('starts a session from the configured defaults, names it, hands it the task, and reports it', async () => {
    const result = await call('create_session', { title: 'Fix "login"\nbug', prompt: 'Fix the login bug. Use the systematic-debugging skill.' })

    // Oracle opens its sessions with the Copilot SDK unless its setting says a terminal.
    expect(host.createSession).toHaveBeenCalledWith('hub', {
      cwd: '~/src/web', provider: 'copilot', terminalBacked: false, allowAllPermissions: true,
      mode: 'autopilot', model: 'model-a', contextTier: 'default',
    })
    expect(host.renameSession).toHaveBeenCalledWith('hub', 'new1', "Fix 'login' bug")
    expect(host.markManaged).toHaveBeenCalledWith(expect.objectContaining({ id: 'new1' }), 'Fix the login bug. Use the systematic-debugging skill.')
    expect(host.sendMessage).toHaveBeenCalledWith('hub', 'new1', 'Fix the login bug. Use the systematic-debugging skill.')
    expect(String(result)).toContain('new1')
    expect(String(result)).toContain('?computer=hub&session=new1')
    expect(activities).toEqual([{
      tool: 'create_session',
      content: 'Started "Fix \'login\' bug" on development with model-a',
      sessionRefs: [{ computerId: 'hub', sessionId: 'new1', title: "Fix 'login' bug" }],
    }])
  })

  it('records the exact delivered prompt identity on task session activity', async () => {
    vi.mocked(host.sendMessage).mockResolvedValueOnce(session('new1', {
      title: "Fix 'login' bug",
      queuedPrompts: [{
        id: 'queued-task-prompt',
        content: 'Fix the login bug.',
        createdAt: '2026-10-15T12:00:00.000Z',
      }],
    }))

    await call('create_session', {
      title: 'Fix login bug',
      prompt: 'Fix the login bug.',
    })

    expect(activities.at(-1)).toMatchObject({
      tool: 'create_session',
      sessionRefs: [{
        computerId: 'hub',
        sessionId: 'new1',
        promptId: 'queued-task-prompt',
        promptDigest: expect.stringMatching(/^[a-f0-9]{64}$/),
        promptQueuePosition: 1,
      }],
    })
  })

  it.each([
    {
      name: 'ignores queued commands and steers that do not become root turns',
      before: session('abc12345-aaaa', {
        messages: [{
          id: 'anchor-root',
          role: 'user',
          content: 'Current root task.',
          createdAt: '2026-10-15T11:50:00.000Z',
        }],
        queuedPrompts: [{
          id: 'queued-command',
          content: '/help',
          createdAt: '2026-10-15T11:51:00.000Z',
          command: true,
        }, {
          id: 'queued-steer',
          content: 'Adjust the running turn.',
          createdAt: '2026-10-15T11:52:00.000Z',
          steer: true,
        }],
      }),
      after: session('abc12345-aaaa', {
        messages: [{
          id: 'anchor-root',
          role: 'user',
          content: 'Current root task.',
          createdAt: '2026-10-15T11:50:00.000Z',
        }],
        queuedPrompts: [{
          id: 'queued-command',
          content: '/help',
          createdAt: '2026-10-15T11:51:00.000Z',
          command: true,
        }, {
          id: 'queued-steer',
          content: 'Adjust the running turn.',
          createdAt: '2026-10-15T11:52:00.000Z',
          steer: true,
        }, {
          id: 'queued-task',
          content: 'Run the focused queue test.',
          createdAt: '2026-10-15T12:00:00.000Z',
        }],
      }),
      anchor: 'anchor-root',
    },
    {
      name: 'uses the post-enqueue anchor when an earlier prompt drains',
      before: session('abc12345-aaaa', {
        messages: [{
          id: 'old-anchor-root',
          role: 'user',
          content: 'Current root task.',
          createdAt: '2026-10-15T11:50:00.000Z',
        }],
        queuedPrompts: [{
          id: 'queued-earlier',
          content: 'Run the earlier check.',
          createdAt: '2026-10-15T11:51:00.000Z',
        }],
      }),
      after: session('abc12345-aaaa', {
        messages: [{
          id: 'old-anchor-root',
          role: 'user',
          content: 'Current root task.',
          createdAt: '2026-10-15T11:50:00.000Z',
        }, {
          id: 'drained-root',
          role: 'user',
          content: 'Run the earlier check.',
          createdAt: '2026-10-15T11:59:00.000Z',
        }],
        queuedPrompts: [{
          id: 'queued-task',
          content: 'Run the focused queue test.',
          createdAt: '2026-10-15T12:00:00.000Z',
        }],
      }),
      anchor: 'drained-root',
    },
  ])('$name', async ({ before, after, anchor }) => {
    vi.mocked(host.listSessions).mockResolvedValue([before])
    vi.mocked(host.sendMessage).mockResolvedValueOnce(after)

    await call('send_to_session', {
      sessionId: 'abc12345',
      message: 'Run the focused queue test.',
    })

    expect(activities.at(-1)).toMatchObject({
      tool: 'send_to_session',
      sessionRefs: [{
        computerId: 'hub',
        sessionId: 'abc12345-aaaa',
        promptId: 'queued-task',
        promptAnchorId: anchor,
        promptQueuePosition: 1,
        promptDigest: expect.stringMatching(/^[a-f0-9]{64}$/),
      }],
    })
  })

  it('opens a terminal session when its setting says so, for a provider that has one', async () => {
    backend = 'terminal'
    await call('create_session', { title: 'Fix', prompt: 'Fix it' })
    expect(host.createSession).toHaveBeenLastCalledWith('hub', expect.objectContaining({
      provider: 'copilot', terminalBacked: true,
    }))
    await call('create_session', { title: 'Review', prompt: 'Review it', provider: 'claude' })
    expect(host.createSession).toHaveBeenLastCalledWith('hub', expect.objectContaining({
      provider: 'claude', terminalBacked: false,
    }))
  })

  it('changes how Oracle opens sessions when the user asks, even in Ask mode', async () => {
    answerOnly = true
    expect(String(await call('set_session_backend', { backend: 'terminal' }))).toContain('terminal (tmux)')
    expect(host.setSessionBackend).toHaveBeenLastCalledWith('terminal')
    expect(activities.at(-1)).toMatchObject({ tool: 'set_session_backend', content: 'Now opening new sessions in a terminal (tmux)' })
    expect(String(await call('set_session_backend', { backend: 'sdk' }))).toContain('Copilot SDK')
    expect(activities.at(-1)).toMatchObject({ content: 'Now opening new sessions with the Copilot SDK' })
    expect(await call('set_session_backend', { backend: 'pty' })).toMatchObject({ resultType: 'failure' })
    expect(host.setSessionBackend).toHaveBeenCalledTimes(2)
    expect(host.createSession).not.toHaveBeenCalled()
  })

  it("uses an SDK session for a provider without tmux, with that provider's own configured defaults", async () => {
    await call('create_session', { title: 'Review', prompt: 'Review it', provider: 'claude', cwd: '/srv/x' })
    expect(host.createSession).toHaveBeenLastCalledWith('hub', {
      cwd: '/srv/x', provider: 'claude', terminalBacked: false, allowAllPermissions: true,
    })

    runtimes.claude = { model: 'claude-agent-model', reasoningEffort: '', contextTier: 'default', mode: 'plan' }
    await call('create_session', { title: 'Review', prompt: 'Review it', provider: 'claude', cwd: '/srv/x' })
    expect(host.createSession).toHaveBeenLastCalledWith('hub', {
      cwd: '/srv/x', provider: 'claude', terminalBacked: false, allowAllPermissions: true,
      mode: 'plan', model: 'claude-agent-model', contextTier: 'default',
    })
  })

  it('lists the exact model ids a provider offers, Copilot unless another provider is asked for', async () => {
    const copilot = String(await call('list_models', {}))
    expect(host.providerModels).toHaveBeenLastCalledWith('hub', 'copilot')
    expect(copilot).toContain("Models for copilot on development (hub); pass the exact id as create_session's model with provider copilot:")
    expect(copilot).toContain('- model-a — Model A · effort low/high · the configured default')
    expect(copilot).toMatch(/^- model-b · long context$/m)

    const claude = String(await call('list_models', { provider: 'claude' }))
    expect(host.providerModels).toHaveBeenLastCalledWith('hub', 'claude')
    expect(claude).toContain('with provider claude')
    expect(claude).toMatch(/^- claude-agent-model — Claude Agent model$/m)
    expect(claude).toContain("No New-session model is configured for claude, so a session started without a model uses claude's own default on development.")

    runtimes.copilot = { model: 'model-z', reasoningEffort: '', contextTier: 'default', mode: '' }
    expect(String(await call('list_models', {}))).toContain(
      "The configured default model-z is not offered here, so a session started without a model uses copilot's own default on development.",
    )

    const offline = await call('list_models', { computer: 'production' })
    expect(JSON.stringify(offline)).toContain('production is offline')
    expect(host.providerModels).toHaveBeenCalledTimes(3)
    expect(activities).toEqual([])
  })

  it('starts a named model on a Copilot session and reports the model the session runs', async () => {
    vi.mocked(host.createSession).mockResolvedValueOnce(session('new1', { runtime: { model: 'model-b' } }))

    const result = String(await call('create_session', {
      title: 'Review', prompt: 'Review it', provider: 'copilot', model: 'model-b',
    }))

    expect(host.createSession).toHaveBeenCalledWith('hub', expect.objectContaining({
      provider: 'copilot', model: 'model-b',
    }))
    expect(result).toContain(', model model-b. Its task was sent.')
    expect(activities.at(-1)).toMatchObject({
      tool: 'create_session',
      content: 'Started "Review" on development with model-b',
    })
  })

  it('reports a model the session started with that differs from the one requested', async () => {
    vi.mocked(host.createSession).mockResolvedValueOnce(session('new1', { runtime: { model: 'model-b' } }))
    vi.mocked(host.sendMessage).mockResolvedValueOnce(session('new1', { runtime: { model: 'model-a' } }))

    const result = String(await call('create_session', { title: 'T', prompt: 'P', model: 'model-b' }))

    expect(result).toContain('model model-a, not the requested model-b')
    expect(activities.at(-1)).toMatchObject({ content: 'Started "T" on development with model-a, not the requested model-b' })

    vi.mocked(host.createSession).mockResolvedValueOnce(session('new1', { runtime: { model: 'model-b' } }))
    const configured = String(await call('create_session', { title: 'T', prompt: 'P' }))
    expect(configured).toContain('model model-b, not the configured default model-a')
    expect(activities.at(-1)).toMatchObject({ content: 'Started "T" on development with model-b, not the configured default model-a' })
  })

  it('says when a session has not reported its model yet, or runs the default model', async () => {
    vi.mocked(host.createSession).mockResolvedValue(session('new1'))
    const configured = String(await call('create_session', { title: 'T', prompt: 'P' }))
    expect(configured).toContain('the configured default model model-a requested; the session has not reported its model yet')
    expect(activities.at(-1)).toMatchObject({ content: 'Started "T" on development with model-a requested' })

    const named = String(await call('create_session', { title: 'T', prompt: 'P', model: 'model-b' }))
    expect(named).toContain('model model-b requested; the session has not reported its model yet')

    runtimes = {}
    const asked = vi.mocked(host.providerModels).mock.calls.length
    const unset = String(await call('create_session', { title: 'T', prompt: 'P' }))
    expect(unset).toContain("copilot's own default model on development; the session has not reported which yet")
    expect(activities.at(-1)).toMatchObject({ content: 'Started "T" on development with the default model' })
    vi.mocked(host.createSession).mockResolvedValueOnce(session('new1', { runtime: { model: 'model-b' } }))
    expect(String(await call('create_session', { title: 'T', prompt: 'P' })))
      .toContain("model model-b, copilot's own default on development")
    // Without a model there is nothing to check against the catalog.
    expect(vi.mocked(host.providerModels).mock.calls.length).toBe(asked)
  })

  it('starts ordinary work on Copilot with its configured default, read when each session starts', async () => {
    runtimes.claude = { model: 'claude-agent-model', reasoningEffort: '', contextTier: 'default', mode: 'plan' }
    // What a browser once sent with the message is not consulted for the runtime.
    host.defaults = () => ({ computerId: 'hub', mode: 'interactive', provider: 'claude', model: 'claude-agent-model', folders: { hub: '~/src/web' } })

    await call('create_session', { title: 'T', prompt: 'P' })
    expect(host.createSession).toHaveBeenLastCalledWith('hub', expect.objectContaining({ provider: 'copilot', model: 'model-a', mode: 'autopilot' }))

    runtimes.copilot = { model: 'model-b', reasoningEffort: '', contextTier: 'long_context', mode: '' }
    await call('create_session', { title: 'T', prompt: 'P' })
    const input = vi.mocked(host.createSession).mock.lastCall![1]
    expect(input).toMatchObject({ provider: 'copilot', model: 'model-b', contextTier: 'long_context' })
    expect(input).not.toHaveProperty('mode')

    await call('create_session', { title: 'T', prompt: 'P', model: 'model-a' })
    expect(host.createSession).toHaveBeenLastCalledWith('hub', expect.objectContaining({ provider: 'copilot', model: 'model-a' }))
    expect(host.providerModels).toHaveBeenLastCalledWith('hub', 'copilot')

    await call('create_session', { title: 'T', prompt: 'P', provider: 'claude' })
    expect(host.createSession).toHaveBeenLastCalledWith('hub', expect.objectContaining({ provider: 'claude', model: 'claude-agent-model', mode: 'plan' }))
  })

  it('applies the configured effort and context only where the model offers them', async () => {
    runtimes.copilot = { model: 'model-a', reasoningEffort: 'high', contextTier: 'long_context', mode: '' }
    await call('create_session', { title: 'T', prompt: 'P' })
    expect(host.createSession).toHaveBeenLastCalledWith('hub', {
      cwd: '~/src/web', provider: 'copilot', terminalBacked: false, allowAllPermissions: true,
      model: 'model-a', reasoningEffort: 'high',
    })

    runtimes.copilot = { model: 'model-b', reasoningEffort: 'max', contextTier: 'long_context', mode: '' }
    await call('create_session', { title: 'T', prompt: 'P' })
    expect(host.createSession).toHaveBeenLastCalledWith('hub', {
      cwd: '~/src/web', provider: 'copilot', terminalBacked: false, allowAllPermissions: true,
      model: 'model-b', contextTier: 'long_context',
    })

    // A named model keeps the configured context size it offers, but not the
    // configured effort, which belongs to the configured model.
    await call('create_session', { title: 'T', prompt: 'P', model: 'model-b' })
    expect(host.createSession).toHaveBeenLastCalledWith('hub', expect.objectContaining({ model: 'model-b', contextTier: 'long_context' }))
    runtimes.copilot = { model: 'model-a', reasoningEffort: 'high', contextTier: 'default', mode: '' }
    await call('create_session', { title: 'T', prompt: 'P', model: 'model-b' })
    const input = vi.mocked(host.createSession).mock.lastCall![1]
    expect(input).toMatchObject({ model: 'model-b', contextTier: 'default' })
    expect(input).not.toHaveProperty('reasoningEffort')
  })

  it('carries the configured context size to a model the user names, and says when it does not run', async () => {
    runtimes.copilot = { model: 'model-a', reasoningEffort: 'high', contextTier: 'long_context', mode: '' }
    const named = String(await call('create_session', { title: 'T', prompt: 'P', model: 'model-b' }))
    const input = vi.mocked(host.createSession).mock.lastCall![1]
    expect(input).toMatchObject({ model: 'model-b', contextTier: 'long_context' })
    expect(input).not.toHaveProperty('reasoningEffort')
    expect(named).toContain('Its task was sent. It runs with long context.')

    runtimes.copilot = { model: 'model-b', reasoningEffort: '', contextTier: 'long_context', mode: '' }
    const lacking = String(await call('create_session', { title: 'T', prompt: 'P', model: 'model-a' }))
    expect(vi.mocked(host.createSession).mock.lastCall![1]).not.toHaveProperty('contextTier')
    expect(lacking).toContain('Its task was sent. model-a does not offer the configured long context, so it runs with default context; tell the user.')

    // What the session reports outranks what was sent.
    vi.mocked(host.createSession).mockResolvedValueOnce(session('new2', { runtime: { model: 'model-b', contextTier: 'default' } }))
    const reported = String(await call('create_session', { title: 'T', prompt: 'P' }))
    expect(vi.mocked(host.createSession).mock.lastCall![1]).toMatchObject({ model: 'model-b', contextTier: 'long_context' })
    expect(reported).toContain('Its task was sent. It reports default context, not the long context asked for; tell the user.')
    expect(host.createSession).toHaveBeenCalledTimes(3)
  })

  it('honors a context size the user asks for, and starts nothing when it cannot run', async () => {
    runtimes.copilot = { model: 'model-b', reasoningEffort: '', contextTier: 'long_context', mode: '' }
    await call('create_session', { title: 'T', prompt: 'P', contextTier: 'default' })
    expect(vi.mocked(host.createSession).mock.lastCall![1]).toMatchObject({ model: 'model-b', contextTier: 'default' })

    runtimes.copilot = { model: 'model-a', reasoningEffort: '', contextTier: 'default', mode: '' }
    const lacking = JSON.stringify(await call('create_session', { title: 'T', prompt: 'P', contextTier: 'long_context' }))
    expect(lacking).toContain('No session was started: model-a from copilot on development does not offer long context.')
    expect(lacking).toContain('Available copilot models with long context: model-b.')
    expect(lacking).toContain('do not switch model or provider on your own')

    // Copilot takes a context size only with a model, and none is configured,
    runtimes = {}
    const unset = JSON.stringify(await call('create_session', { title: 'T', prompt: 'P', contextTier: 'long_context' }))
    expect(unset).toContain('No session was started: long context needs a model from copilot on development.')
    expect(unset).toContain('Available copilot models with long context: model-b.')
    // or the configured one is not offered.
    runtimes.copilot = { model: 'model-z', reasoningEffort: '', contextTier: 'long_context', mode: '' }
    const missing = JSON.stringify(await call('create_session', { title: 'T', prompt: 'P', contextTier: 'long_context' }))
    expect(missing).toContain('No session was started: long context needs a model from copilot on development, and the configured default model-z is not available there.')

    // A refusal from the provider itself goes back to the user too.
    runtimes.copilot = { model: 'model-b', reasoningEffort: '', contextTier: 'default', mode: '' }
    vi.mocked(host.providerModels).mockRejectedValueOnce(new Error('catalog offline'))
    vi.mocked(host.createSession).mockRejectedValueOnce(new Error('Selected context tier is not supported by this model'))
    const refused = JSON.stringify(await call('create_session', { title: 'T', prompt: 'P', contextTier: 'long_context' }))
    expect(refused).toContain('No session was started: model-b from copilot on development does not offer long context (Selected context tier is not supported by this model).')
    expect(refused).toContain('Available copilot models with long context: model-b.')

    const claude = JSON.stringify(await call('create_session', { title: 'T', prompt: 'P', provider: 'claude', model: 'claude-agent-model', contextTier: 'long_context' }))
    expect(claude).toContain('No session was started: claude-agent-model from claude on development does not offer long context. No claude model offers long context.')
    expect(host.createSession).toHaveBeenCalledTimes(2)
    expect(host.sendMessage).toHaveBeenCalledOnce()
  })

  it("starts on the provider's own default, and says so, when the configured model is not offered", async () => {
    runtimes.copilot = { model: 'model-z', reasoningEffort: 'high', contextTier: 'long_context', mode: 'autopilot' }
    vi.mocked(host.createSession).mockResolvedValueOnce(session('new1'))

    const result = String(await call('create_session', { title: 'T', prompt: 'P' }))

    expect(host.createSession).toHaveBeenCalledWith('hub', {
      cwd: '~/src/web', provider: 'copilot', terminalBacked: false, allowAllPermissions: true, mode: 'autopilot',
    })
    expect(result).toContain("copilot's own default model on development; the session has not reported which yet. Its task was sent.")
    expect(result).toContain("The configured default model-z is not available from copilot on development, so the session uses copilot's own default; tell the user. It runs with default context, since the configured long context needs a model.")
    expect(activities.at(-1)).toMatchObject({
      content: 'Started "T" on development with the default model; the configured default model-z is not available',
    })
  })

  it("falls back to the provider's own default when it refuses the configured model before creating anything", async () => {
    vi.mocked(host.providerModels).mockRejectedValue(new Error('catalog offline'))
    vi.mocked(host.createSession)
      .mockRejectedValueOnce(new Error('Selected model is not available'))
      .mockResolvedValueOnce(session('new1', { runtime: { model: 'model-b' } }))

    const result = String(await call('create_session', { title: 'T', prompt: 'P' }))

    expect(host.createSession).toHaveBeenCalledTimes(2)
    expect(vi.mocked(host.createSession).mock.calls[0][1]).toMatchObject({ model: 'model-a', contextTier: 'default' })
    expect(host.createSession).toHaveBeenLastCalledWith('hub', {
      cwd: '~/src/web', provider: 'copilot', terminalBacked: false, allowAllPermissions: true, mode: 'autopilot',
    })
    expect(result).toContain("model model-b, copilot's own default on development")
    expect(result).toContain("The configured default model-a is not available from copilot on development (Selected model is not available), so the session uses copilot's own default; tell the user.")
    expect(activities.at(-1)).toMatchObject({
      content: 'Started "T" on development with model-b; the configured default model-a is not available',
    })

    // Any other failure is not a refusal of the model, so nothing is retried.
    vi.mocked(host.createSession).mockRejectedValueOnce(new Error('disk full'))
    expect(JSON.stringify(await call('create_session', { title: 'T', prompt: 'P' }))).toContain('disk full')
    expect(host.createSession).toHaveBeenCalledTimes(3)
  })

  it('keeps a configured model the provider accepts when it refuses only its configured effort or context', async () => {
    vi.mocked(host.providerModels).mockRejectedValue(new Error('catalog offline'))
    runtimes.copilot = { model: 'model-a', reasoningEffort: 'high', contextTier: 'long_context', mode: '' }
    vi.mocked(host.createSession)
      .mockRejectedValueOnce(new Error('Selected reasoning effort is not supported by this model'))
      .mockRejectedValueOnce(new Error('Selected context tier is not supported by this model'))
      .mockResolvedValueOnce(session('new1', { runtime: { model: 'model-a' } }))

    const result = String(await call('create_session', { title: 'T', prompt: 'P' }))

    const inputs = vi.mocked(host.createSession).mock.calls.map(([, input]) => input)
    expect(inputs).toHaveLength(3)
    expect(inputs[0]).toMatchObject({ model: 'model-a', reasoningEffort: 'high', contextTier: 'long_context' })
    expect(inputs[1]).toMatchObject({ model: 'model-a', contextTier: 'long_context' })
    expect(inputs[1]).not.toHaveProperty('reasoningEffort')
    expect(inputs[2]).toMatchObject({ model: 'model-a' })
    expect(inputs[2]).not.toHaveProperty('reasoningEffort')
    expect(inputs[2]).not.toHaveProperty('contextTier')
    expect(result).toContain('model model-a. Its task was sent. model-a does not offer the configured long context, so it runs with default context; tell the user.')
    expect(result).not.toContain('not available')
  })

  it('returns the choices, not a raw error or another setting, when an effort the user asks for cannot run', async () => {
    vi.mocked(host.providerModels).mockRejectedValueOnce(new Error('catalog offline'))
    vi.mocked(host.createSession)
      .mockRejectedValueOnce(new Error('Selected reasoning effort is not supported by this model'))
    const refused = JSON.stringify(await call('create_session', { title: 'T', prompt: 'P', reasoningEffort: 'max' }))
    expect(refused).toContain('No session was started: model-a from copilot on development does not offer effort max (Selected reasoning effort is not supported by this model).')
    expect(refused).toContain('Available copilot models: model-a (effort low/high), model-b.')
    expect(host.createSession).toHaveBeenCalledOnce()

    // Copilot takes an effort only with a model, and none is configured.
    runtimes = {}
    vi.mocked(host.createSession)
      .mockRejectedValueOnce(new Error('A model is required when setting effort or context'))
    const unset = JSON.stringify(await call('create_session', { title: 'T', prompt: 'P', reasoningEffort: 'high' }))
    expect(vi.mocked(host.createSession).mock.lastCall![1]).toMatchObject({ reasoningEffort: 'high' })
    expect(unset).toContain('No session was started: effort high needs a model from copilot on development (A model is required when setting effort or context).')
    expect(unset).toContain('Available copilot models: model-a (effort low/high), model-b.')
    expect(unset).toContain('do not switch model or provider on your own')

    // The effort asked for outlives a configured default that is not offered.
    runtimes.copilot = { model: 'model-z', reasoningEffort: 'low', contextTier: 'default', mode: '' }
    vi.mocked(host.createSession)
      .mockRejectedValueOnce(new Error('A model is required when setting effort or context'))
    const missing = JSON.stringify(await call('create_session', { title: 'T', prompt: 'P', reasoningEffort: 'high' }))
    const input = vi.mocked(host.createSession).mock.lastCall![1]
    expect(input).toMatchObject({ reasoningEffort: 'high' })
    expect(input).not.toHaveProperty('model')
    expect(missing).toContain('No session was started: effort high needs a model from copilot on development, and the configured default model-z is not available there (A model is required when setting effort or context).')
    expect(host.createSession).toHaveBeenCalledTimes(3)
    expect(host.sendMessage).not.toHaveBeenCalled()
    expect(activities).toEqual([])
  })

  it('starts nothing for a model or effort the provider lacks, and lists its models instead of switching', async () => {
    const missing = await call('create_session', { title: 'T', prompt: 'P', model: 'model-z' })
    expect(missing).toMatchObject({ resultType: 'failure' })
    const text = JSON.stringify(missing)
    expect(text).toContain('No session was started: model-z is not available from copilot on development.')
    expect(text).toContain('Available copilot models: model-a (effort low/high), model-b.')
    expect(text).toContain('do not switch model or provider on your own')

    const effort = JSON.stringify(await call('create_session', { title: 'T', prompt: 'P', model: 'model-a', reasoningEffort: 'max' }))
    expect(effort).toContain('No session was started: model-a from copilot on development does not offer effort max.')
    expect(effort).toContain('Available copilot models: model-a (effort low/high), model-b.')

    expect(host.providerModels).toHaveBeenCalledWith('hub', 'copilot')
    expect(host.createSession).not.toHaveBeenCalled()
    expect(host.renameSession).not.toHaveBeenCalled()
    expect(host.sendMessage).not.toHaveBeenCalled()
    expect(host.markManaged).not.toHaveBeenCalled()
    expect(activities).toEqual([])
  })

  it('leaves the final word to the provider when its catalog is unreadable or changed', async () => {
    vi.mocked(host.providerModels).mockRejectedValueOnce(new Error('catalog offline'))
    expect(String(await call('create_session', { title: 'T', prompt: 'P', model: 'model-b' }))).toContain('Its task was sent.')
    expect(host.createSession).toHaveBeenCalledOnce()

    vi.mocked(host.createSession).mockRejectedValueOnce(new Error('Selected model is not available'))
    const changed = JSON.stringify(await call('create_session', { title: 'T', prompt: 'P', model: 'model-b' }))
    expect(changed).toContain('No session was started: model-b is not available from copilot on development (Selected model is not available).')
    expect(changed).toContain('Available copilot models: model-a (effort low/high), model-b.')

    vi.mocked(host.createSession).mockRejectedValueOnce(new Error('Selected model is not available'))
    vi.mocked(host.providerModels)
      .mockResolvedValueOnce(copilotModels)
      .mockRejectedValueOnce(new Error('catalog offline'))
    const unread = JSON.stringify(await call('create_session', { title: 'T', prompt: 'P', model: 'model-b' }))
    expect(unread).toContain('Its model list could not be read (catalog offline); call list_models.')

    vi.mocked(host.createSession).mockRejectedValueOnce(new Error('disk full'))
    expect(JSON.stringify(await call('create_session', { title: 'T', prompt: 'P', model: 'model-b' }))).toContain('disk full')
  })

  it('asks discovery about a provider last reported unavailable before refusing it', async () => {
    let recordedAvailable = false
    let loggedIn = false
    const current = () => computers.map((computer) => computer.id !== 'hub' ? computer : {
      ...computer,
      providers: computer.providers?.map((provider) => provider.id !== 'claude' || recordedAvailable
        ? provider
        : { ...provider, available: false, unavailableReason: 'Run claude auth login on this computer' }),
    })
    host.computers = current
    host.findComputer = (nameOrId) => current().find((computer) => computer.id === nameOrId || computer.name === nameOrId)
    vi.mocked(host.providerModels).mockImplementation(async (_computerId, provider) => {
      if (provider !== 'claude') return copilotModels
      if (!loggedIn) throw new Error('Run claude auth login on this computer')
      // As the hub does, an answer refreshes what the computer reports.
      recordedAvailable = true
      return claudeModels
    })

    const listRefused = await call('list_models', { provider: 'claude' })
    expect(listRefused).toMatchObject({ resultType: 'failure' })
    expect(JSON.stringify(listRefused)).toContain('claude is not available on development: Run claude auth login on this computer.')
    const createRefused = await call('create_session', { title: 'T', prompt: 'P', provider: 'claude' })
    expect(JSON.stringify(createRefused)).toContain('claude is not available on development: Run claude auth login on this computer.')
    expect(host.createSession).not.toHaveBeenCalled()

    loggedIn = true
    expect(String(await call('list_models', { provider: 'claude' }))).toMatch(/^- claude-agent-model — Claude Agent model$/m)

    recordedAvailable = false
    const asked = vi.mocked(host.providerModels).mock.calls.length
    await call('create_session', { title: 'T', prompt: 'P', provider: 'claude', model: 'claude-agent-model' })
    expect(host.createSession).toHaveBeenCalledWith('hub', expect.objectContaining({ provider: 'claude', model: 'claude-agent-model' }))
    // The catalog that answered is the one the model is checked against.
    expect(vi.mocked(host.providerModels).mock.calls.length - asked).toBe(1)
  })

  it('refuses an offline or unknown computer with a readable failure', async () => {
    const offline = await call('create_session', { title: 'X', prompt: 'Y', computer: 'production' })
    expect(offline).toMatchObject({ resultType: 'failure' })
    expect(JSON.stringify(offline)).toContain('production is offline')
    const unknown = await call('create_session', { title: 'X', prompt: 'Y', computer: 'nowhere' })
    expect(JSON.stringify(unknown)).toContain('No computer named nowhere')
    expect(host.createSession).not.toHaveBeenCalled()
  })

  it('reports a created session whose task could not be delivered so it is not created twice', async () => {
    vi.mocked(host.sendMessage).mockRejectedValueOnce(new Error('terminal not ready'))
    const result = await call('create_session', { title: 'T', prompt: 'P' })
    expect(result).toMatchObject({ resultType: 'failure' })
    expect(JSON.stringify(result)).toMatch(/new1.*was created.*terminal not ready.*send_to_session/)
  })

  it('finds a session by id or unique prefix and sends it a follow-up', async () => {
    await call('send_to_session', { sessionId: 'def67890', message: 'Also add tests' })
    expect(host.sendMessage).toHaveBeenCalledWith('hub', 'def67890-bbbb', 'Also add tests', { steer: true })
    expect(activities.at(-1)).toMatchObject({ tool: 'send_to_session', content: 'Sent a message to "Session def67890-bbbb"' })

    const missing = await call('send_to_session', { sessionId: 'zzz', message: 'hi' })
    expect(JSON.stringify(missing)).toContain('No open session matches zzz')
  })

  it('reads recent messages, shortening long ones', async () => {
    const result = String(await call('get_session', { sessionId: 'abc12345-aaaa', messages: 3 }))
    expect(result).toContain('message 9')
    expect(result).not.toContain('message 8')
    expect(result).toContain('… (truncated)')
    expect(result.length).toBeLessThan(6000)
  })

  it('reads a closed session from history', async () => {
    const result = String(await call('get_session', { sessionId: 'old99999-cccc' }))
    expect(host.readSession).toHaveBeenCalledWith('hub', 'old99999-cccc')
    expect(result).toContain('closed')
  })

  it('asks a session about its work without prompting it', async () => {
    expect(await call('ask_session', { sessionId: 'abc12345', question: 'What did you find?' }))
      .toBe('It fixed the bug and opened PR #12.')
    expect(host.askSession).toHaveBeenCalledWith('hub', 'abc12345-aaaa', 'What did you find?')
  })

  it("adds a working session's current state, which its side question cannot see", async () => {
    vi.mocked(host.listSessions).mockResolvedValue([
      session('abc12345-aaaa'),
      session('def67890-bbbb', { status: 'running', activity: 'Running sleep 75 && echo slept' }),
      session('ghi24680-cccc', { status: 'waiting', pendingPermission: { requestId: 'p1', title: 'Run the deploy script', kind: 'shell' } as ManagedSession['pendingPermission'] }),
    ])
    const running = String(await call('ask_session', { sessionId: 'def67890', question: 'What are you waiting on?' }))
    expect(running).toMatch(/^It fixed the bug and opened PR #12\./)
    expect(running).toContain('in the middle of a turn')
    expect(running).toContain('Running sleep 75 && echo slept')
    const waiting = String(await call('ask_session', { sessionId: 'ghi24680', question: 'What now?' }))
    expect(waiting).toContain('in the middle of a turn')
    expect(waiting).toContain('Run the deploy script')
    // A session between turns is answered as it is.
    expect(await call('ask_session', { sessionId: 'abc12345', question: 'What did you find?' }))
      .toBe('It fixed the bug and opened PR #12.')
  })

  it("starts sessions in Oracle's own folder for that computer, before the user's default", async () => {
    oracleFolders = { hub: '/home/me/src/oracle' }
    await call('create_session', { title: 'Docs', prompt: 'Write the docs.' })
    expect(host.createSession).toHaveBeenLastCalledWith('hub', expect.objectContaining({ cwd: '/home/me/src/oracle' }))
    // A folder the task names still wins.
    await call('create_session', { title: 'Docs', prompt: 'Write the docs.', cwd: '~/src/docs' })
    expect(host.createSession).toHaveBeenLastCalledWith('hub', expect.objectContaining({ cwd: '~/src/docs' }))
    oracleFolders = {}
    await call('create_session', { title: 'Docs', prompt: 'Write the docs.' })
    expect(host.createSession).toHaveBeenLastCalledWith('hub', expect.objectContaining({ cwd: '~/src/web' }))
  })

  it('changes where Oracle starts sessions when the user asks, even in Ask only', async () => {
    answerOnly = true
    source = 'typed'
    expect(String(await call('set_session_folder', { computer: 'development', folder: '~/src/app' })))
      .toContain('/home/me/src/app')
    expect(host.setSessionFolder).toHaveBeenLastCalledWith('hub', '~/src/app')
    expect(activities.at(-1)).toMatchObject({ tool: 'set_session_folder', content: 'Now starting sessions on development in /home/me/src/app' })
    expect(await call('set_session_folder', { folder: '~/missing' })).toMatchObject({ resultType: 'failure' })
    expect(String(await call('set_session_folder', { folder: null }))).toContain("development's default folder")
    expect(host.setSessionFolder).toHaveBeenLastCalledWith('hub', undefined)
    expect(activities.at(-1)).toMatchObject({ content: "Back to development's default folder for new sessions" })
  })

  it('answers what a session is waiting on, such as folder trust, and only that', async () => {
    const waiting = session('abc12345-aaaa', { cwd: '/home/me/src/llmlab', status: 'waiting', pendingPermission: {
      requestId: 'trust-1',
      title: 'Trust folder for this session: /home/me/src/llmlab',
      kind: 'terminal',
      choiceCount: 3,
      options: [
        { optionId: 'terminal:allow', name: 'Trust for this session', kind: 'allow_once' },
        { optionId: 'terminal:stop', name: 'Stop', kind: 'reject_once' },
      ],
    } })
    vi.mocked(host.readSession).mockResolvedValue(waiting)
    expect(String(await call('answer_session', { sessionId: 'abc12345', response: 'approve' }))).toContain('Trust for this session')
    expect(host.replyPermission).toHaveBeenLastCalledWith('hub', 'abc12345-aaaa', 'trust-1', 'terminal:allow')
    expect(activities.at(-1)).toMatchObject({
      tool: 'answer_session',
      content: 'Answered "Trust folder for this session: /home/me/src/llmlab" on "Session abc12345-aaaa": Trust for this session',
    })
    await call('answer_session', { sessionId: 'abc12345', response: 'stop' })
    expect(host.replyPermission).toHaveBeenLastCalledWith('hub', 'abc12345-aaaa', 'trust-1', 'terminal:stop')
    const unknown = await call('answer_session', { sessionId: 'abc12345', response: 'maybe' })
    expect(JSON.stringify(unknown)).toContain('Trust for this session')
    expect(unknown).toMatchObject({ resultType: 'failure' })
    // An answer meant for another prompt is never given to this one.
    const moved = await call('answer_session', { sessionId: 'abc12345', response: 'approve', requestId: 'older' })
    expect(moved).toMatchObject({ resultType: 'failure' })
    expect(host.replyPermission).toHaveBeenCalledTimes(2)

    vi.mocked(host.readSession).mockResolvedValue(session('abc12345-aaaa'))
    expect(await call('answer_session', { sessionId: 'abc12345', response: 'approve' })).toMatchObject({ resultType: 'failure' })
  })

  it("answers a session's question with a choice, its own words, several choices, or a form", async () => {
    const question = (change: Partial<NonNullable<ManagedSession['pendingUserInput']>>) => session('abc12345-aaaa', {
      status: 'waiting',
      pendingUserInput: { requestId: 'q1', question: 'Which database?', choices: ['Postgres', 'SQLite'], allowFreeform: false, ...change },
    })
    vi.mocked(host.readSession).mockResolvedValue(question({}))
    await call('answer_session', { sessionId: 'abc12345', response: 'sqlite' })
    expect(host.replyUserInput).toHaveBeenLastCalledWith('hub', 'abc12345-aaaa', 'q1', { answer: 'SQLite', wasFreeform: false })
    expect(await call('answer_session', { sessionId: 'abc12345', response: 'MySQL' })).toMatchObject({ resultType: 'failure' })

    vi.mocked(host.readSession).mockResolvedValue(question({ allowFreeform: true }))
    await call('answer_session', { sessionId: 'abc12345', response: 'MySQL 8' })
    expect(host.replyUserInput).toHaveBeenLastCalledWith('hub', 'abc12345-aaaa', 'q1', { answer: 'MySQL 8', wasFreeform: true })

    vi.mocked(host.readSession).mockResolvedValue(question({ multiSelect: true }))
    await call('answer_session', { sessionId: 'abc12345', responses: ['postgres', 'SQLite'] })
    expect(host.replyUserInput).toHaveBeenLastCalledWith('hub', 'abc12345-aaaa', 'q1', {
      answer: 'Postgres, SQLite', wasFreeform: false, answers: ['Postgres', 'SQLite'],
    })

    vi.mocked(host.readSession).mockResolvedValue(question({
      choices: [],
      form: { fields: [{ name: 'port', type: 'number', label: 'Port', required: true }] } as unknown as NonNullable<ManagedSession['pendingUserInput']>['form'],
    }))
    await call('answer_session', { sessionId: 'abc12345', values: { port: 5432 } })
    expect(host.replyUserInput).toHaveBeenLastCalledWith('hub', 'abc12345-aaaa', 'q1', {
      answer: JSON.stringify({ port: 5432 }), wasFreeform: false, values: { port: 5432 },
    })
    await call('answer_session', { sessionId: 'abc12345', dismiss: true })
    expect(host.replyUserInput).toHaveBeenLastCalledWith('hub', 'abc12345-aaaa', 'q1', { action: 'cancel', answer: '', wasFreeform: false })
  })

  it('trusts the folder a new session opens on, then hands it its task', async () => {
    let reads = 0
    vi.mocked(host.readSession).mockImplementation(async (_computerId, id) => {
      reads += 1
      return reads === 1 ? session(id, { cwd: '/home/me/src/llmlab', status: 'waiting', pendingPermission: {
      requestId: 'trust-1',
      title: 'Trust folder for this session: /home/me/src/llmlab',
      kind: 'terminal',
      choiceCount: 3,
      options: [
        { optionId: 'terminal:allow', name: 'Trust for this session', kind: 'allow_once' },
        { optionId: 'terminal:stop', name: 'Stop', kind: 'reject_once' },
      ],
    } }) : session(id)
    })
    const result = await call('create_session', { title: 'LLM lab', prompt: 'Check every product.', cwd: '~/src/llmlab' })
    expect(host.replyPermission).toHaveBeenCalledWith('hub', 'new1', 'trust-1', 'terminal:allow')
    expect(host.sendMessage).toHaveBeenCalledWith('hub', 'new1', 'Check every product.')
    expect(vi.mocked(host.replyPermission).mock.invocationCallOrder[0])
      .toBeLessThan(vi.mocked(host.sendMessage).mock.invocationCallOrder[0])
    expect(String(result)).toContain('Its task was sent.')
    expect(activities.map((activity) => activity.content)).toEqual([
      'Trusted /home/me/src/llmlab for "LLM lab"',
      'Started "LLM lab" on development with model-a',
    ])
  })

  it('trusts a folder whose prompt appears only after the first delivery fails, and tries once more', async () => {
    let reads = 0
    vi.mocked(host.readSession).mockImplementation(async (_computerId, id) => {
      reads += 1
      return reads === 2 ? session(id, { cwd: '/home/me/src/llmlab', status: 'waiting', pendingPermission: {
      requestId: 'trust-1',
      title: 'Trust folder for this session: /home/me/src/llmlab',
      kind: 'terminal',
      choiceCount: 3,
      options: [
        { optionId: 'terminal:allow', name: 'Trust for this session', kind: 'allow_once' },
        { optionId: 'terminal:stop', name: 'Stop', kind: 'reject_once' },
      ],
    } }) : session(id)
    })
    vi.mocked(host.sendMessage).mockRejectedValueOnce(new Error('Copilot is showing a prompt'))
    expect(String(await call('create_session', { title: 'LLM lab', prompt: 'Go.' }))).toContain('Its task was sent.')
    expect(host.sendMessage).toHaveBeenCalledTimes(2)
    expect(host.replyPermission).toHaveBeenCalledTimes(1)
  })

  it('trusts only a real folder-trust prompt for the folder the session was given', async () => {
    const lookalike = (change: Record<string, unknown>) => session('new1', {
      cwd: '/home/me/src/web',
      status: 'waiting',
      pendingPermission: {
        requestId: 'p9',
        title: 'Trust folder for this session: /home/me/src/web',
        kind: 'terminal',
        choiceCount: 3,
        options: [
          { optionId: 'terminal:allow', name: 'Trust for this session', kind: 'allow_once' },
          { optionId: 'terminal:stop', name: 'Stop', kind: 'reject_once' },
        ],
        ...change,
      },
    })
    for (const change of [
      { kind: 'shell' },
      { title: 'Trust folder for this session: /home/me/elsewhere' },
      { options: [{ optionId: 'allow', name: 'Allow', kind: 'allow_once' }] },
    ]) {
      vi.mocked(host.readSession).mockResolvedValue(lookalike(change))
      vi.mocked(host.sendMessage).mockClear()
      vi.mocked(host.replyPermission).mockClear()
      vi.mocked(host.sendMessage).mockRejectedValueOnce(new Error('Copilot is showing a prompt'))
      const result = await call('create_session', { title: 'Web', prompt: 'Go.' })
      expect(result, JSON.stringify(change)).toMatchObject({ resultType: 'failure' })
      expect(JSON.stringify(result)).toContain('answer_session')
      expect(host.replyPermission).not.toHaveBeenCalled()
    }
    // The real prompt, for the session's own folder, even wrapped across lines.
    let reads = 0
    vi.mocked(host.readSession).mockImplementation(async () => {
      reads += 1
      return reads === 1 ? lookalike({ title: 'Trust folder for this session: /home/me/src/\nweb' }) : session('new1', { cwd: '/home/me/src/web' })
    })
    vi.mocked(host.sendMessage).mockResolvedValue(session('new1'))
    expect(String(await call('create_session', { title: 'Web', prompt: 'Go.' }))).toContain('Its task was sent.')
    expect(host.replyPermission).toHaveBeenCalledWith('hub', 'new1', 'p9', 'terminal:allow')
  })

  it('shows what a waiting session asks, in enough detail to answer it', async () => {
    vi.mocked(host.readSession).mockResolvedValueOnce(session('abc12345-aaaa', {
      status: 'waiting',
      pendingPermission: {
        requestId: 'perm-7', title: 'Run npm publish', kind: 'shell',
        options: [
          { optionId: 'allow', name: 'Allow once', kind: 'allow_once' },
          { optionId: 'deny', name: 'Deny', kind: 'reject_once' },
        ],
      },
    }))
    const permission = String(await call('get_session', { sessionId: 'abc12345' }))
    expect(permission).toContain('Waiting for the user to approve: Run npm publish (requestId perm-7). Options: "Allow once", "Deny".')
    vi.mocked(host.readSession).mockResolvedValueOnce(session('abc12345-aaaa', {
      status: 'waiting',
      pendingUserInput: {
        requestId: 'q-3', question: 'Which database?', choices: ['Postgres', 'SQLite'], allowFreeform: true, multiSelect: true,
      },
    }))
    const question = String(await call('get_session', { sessionId: 'abc12345' }))
    expect(question).toContain('Waiting for the user to answer: Which database? (requestId q-3). Choices: "Postgres", "SQLite"; several may be chosen; free text is allowed.')
    vi.mocked(host.readSession).mockResolvedValueOnce(session('abc12345-aaaa', {
      status: 'waiting',
      pendingUserInput: {
        requestId: 'f-1', question: 'Configure the service', choices: [], allowFreeform: false,
        form: { fields: [
          { name: 'port', title: 'Port', type: 'integer', required: true, minimum: 1, maximum: 65535 },
          { name: 'tier', title: 'Tier', type: 'string', required: false, options: [{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }] },
        ] },
      },
    }))
    const form = String(await call('get_session', { sessionId: 'abc12345' }))
    expect(form).toContain('Form fields: port (integer, required, 1–65535); tier (string, one of free, pro).')
  })

  it('steers a busy session instead of queueing behind its turn', async () => {
    const result = String(await call('send_to_session', { sessionId: 'def67890', message: 'Focus on the failing test' }))
    expect(host.sendMessage).toHaveBeenCalledTimes(1)
    expect(host.sendMessage).toHaveBeenCalledWith('hub', 'def67890-bbbb', 'Focus on the failing test', { steer: true })
    expect(result).toContain('steered into the work it is doing')
    expect(result).not.toContain('queued')
  })

  it('does not replace a task root prompt with a busy-session steer receipt', async () => {
    source = 'task'
    taskSessionIds = new Set(['def67890-bbbb'])
    const rootPrompt = {
      id: 'root-task-prompt',
      role: 'user' as const,
      content: 'Run the focused queue test.',
      createdAt: '2026-10-15T11:50:00.000Z',
    }
    vi.mocked(host.listSessions).mockResolvedValue([
      session('def67890-bbbb', {
        status: 'running',
        messages: [rootPrompt],
      }),
    ])
    vi.mocked(host.sendMessage).mockResolvedValueOnce(
      session('def67890-bbbb', {
        status: 'running',
        messages: [rootPrompt],
        queuedPrompts: [{
          id: 'steer-receipt',
          content: 'Focus on the failing test',
          createdAt: '2026-10-15T12:00:00.000Z',
          steer: true,
        }],
      }),
    )

    await call('send_to_session', {
      sessionId: 'def67890',
      message: 'Focus on the failing test',
    })

    expect(activities.at(-1)).toMatchObject({
      tool: 'send_to_session',
      sessionRefs: [{
        computerId: 'hub',
        sessionId: 'def67890-bbbb',
      }],
    })
    expect(activities.at(-1)!.sessionRefs![0]!.promptId).toBeUndefined()
  })

  it('queues for a busy session only when the steer was refused before anything was sent', async () => {
    vi.mocked(host.sendMessage).mockRejectedValueOnce(Object.assign(
      new Error('A follow-up prompt is already being sent.'), { statusCode: 409, uncertainDelivery: false },
    ))
    const result = String(await call('send_to_session', { sessionId: 'def67890', message: 'Focus on the failing test' }))
    expect(vi.mocked(host.sendMessage).mock.calls).toEqual([
      ['hub', 'def67890-bbbb', 'Focus on the failing test', { steer: true }],
      ['hub', 'def67890-bbbb', 'Focus on the failing test'],
    ])
    expect(result).toContain('queued')
  })

  it.each([
    ['may have been delivered', { statusCode: 409, uncertainDelivery: true }],
    ['says nothing about delivery', { statusCode: 500 }],
  ])('never sends a steer twice when it %s', async (_name, fields) => {
    vi.mocked(host.sendMessage).mockRejectedValueOnce(Object.assign(new Error('Lost the terminal'), fields))
    const result = await call('send_to_session', { sessionId: 'def67890', message: 'Focus on the failing test' })
    expect(result).toMatchObject({ resultType: 'failure' })
    expect(host.sendMessage).toHaveBeenCalledTimes(1)
  })

  it('queues for a busy Claude session, which has no steering', async () => {
    vi.mocked(host.listSessions).mockResolvedValue([session('cla12345-dddd', { status: 'running', provider: 'claude' })])
    const result = String(await call('send_to_session', { sessionId: 'cla12345', message: 'Next step' }))
    expect(vi.mocked(host.sendMessage).mock.calls).toEqual([['hub', 'cla12345-dddd', 'Next step']])
    expect(result).not.toContain('steered')
    expect(result).toContain('queued')
  })

  it('sends to an idle session as before, with nothing to steer', async () => {
    const result = String(await call('send_to_session', { sessionId: 'abc12345', message: 'Next step' }))
    expect(host.sendMessage).toHaveBeenCalledWith('hub', 'abc12345-aaaa', 'Next step')
    expect(result).not.toContain('steered')
  })

  it('reopens a closed session to steer it', async () => {
    expect(String(await call('send_to_session', { sessionId: 'old99999', message: 'Pick this back up.' }))).toContain('Sent')
    expect(host.reopenSession).toHaveBeenCalledWith('hub', 'old99999-cccc')
    expect(host.sendMessage).toHaveBeenLastCalledWith('hub', 'old99999-cccc', 'Pick this back up.')
    expect(activities.map((activity) => activity.content)).toEqual([
      'Reopened "Session old99999-cccc"',
      'Sent a message to "Session old99999-cccc"',
    ])
  })

  it('finds a recently closed session by what it was about', async () => {
    vi.mocked(host.listClosedSessions).mockResolvedValue([
      ...await host.listClosedSessions(),
      session('zzz11111-dddd', {
        isOpen: false,
        title: 'Docs',
        closedAt: '2026-10-13T09:00:00.000Z',
        closedContext: { title: 'Docs', cwd: '/home/me/src/docs', prompts: ['Fix the README'] },
      }),
    ])

    const found = String(await call('list_closed_sessions', { query: 'Rollback MIGRATION' }))

    expect(found).toContain('old99999-cccc')
    expect(found).toContain('closed 2026-10-14T09:00:00.000Z')
    expect(found).toContain('reopenable until 2026-10-28T09:00:00.000Z')
    expect(found).toContain('"Draft the database migration plan"')
    expect(found).toContain('"Add a rollback &lt;step&gt;"')
    expect(found).toContain('"The plan has &quot;three&quot; phases."')
    expect(found).not.toContain('zzz11111-dddd')
    expect(String(await call('list_closed_sessions', {}))).toContain('zzz11111-dddd')
    expect(String(await call('list_closed_sessions', { query: 'kubernetes' }))).toContain('none match')
    vi.mocked(host.readSession).mockResolvedValueOnce(session('old99999-cccc', {
      isOpen: false, closedAt: '2026-10-14T09:00:00.000Z',
    }))
    expect(String(await call('get_session', { sessionId: 'old99999' })))
      .toContain('reopenable until 2026-10-28T09:00:00.000Z')
  })

  it('reopens a closed session without sending it anything', async () => {
    const result = String(await call('reopen_session', { sessionId: 'old99999' }))

    expect(host.reopenSession).toHaveBeenCalledWith('hub', 'old99999-cccc')
    expect(host.sendMessage).not.toHaveBeenCalled()
    expect(result).toContain('Reopened [Session old99999-cccc](?computer=hub&session=old99999-cccc)')
    expect(activities).toEqual([{
      tool: 'reopen_session',
      content: 'Reopened "Session old99999-cccc"',
      sessionRefs: [{ computerId: 'hub', sessionId: 'old99999-cccc', title: 'Session old99999-cccc' }],
    }])
    expect(String(await call('reopen_session', { sessionId: 'abc12345' }))).toContain('already open')
    expect(host.reopenSession).toHaveBeenCalledTimes(1)
  })

  it('passes on why a closed session could not be reopened', async () => {
    vi.mocked(host.reopenSession).mockRejectedValueOnce(new Error('Unable to reopen terminal session from its saved Copilot state'))

    const result = await call('reopen_session', { sessionId: 'old99999' })

    expect(result).toMatchObject({ resultType: 'failure' })
    expect(JSON.stringify(result)).toContain('Could not reopen [Session old99999-cccc]')
    expect(JSON.stringify(result)).toContain('saved Copilot state')
    expect(activities).toEqual([])
  })

  it('only asks the user to close a session and never closes one itself', async () => {
    const result = await call('close_session', { sessionId: 'abc12345', userConfirmed: true, reason: 'It finished.' })
    expect(host.requestCloseConfirmation).toHaveBeenCalledWith(expect.objectContaining({ id: 'abc12345-aaaa' }), 'It finished.')
    expect(String(result)).toContain('stays open until they confirm')
    expect(Object.keys(host)).not.toContain('deleteSession')
  })

  describe('when the user lets Oracle close the sessions it started', () => {
    const started = {
      'hub:abc12345-aaaa': {
        computerId: 'hub', sessionId: 'abc12345-aaaa', title: 'Session abc12345-aaaa',
        origin: 'manager' as const, firstSeenAt: '2026-10-15T10:00:00.000Z',
      },
    }
    let closeWithoutAsking: ReturnType<typeof vi.fn>
    let closes: number
    let unfinished: () => Array<{ computerId: string; sessionId: string }>
    let live: boolean
    let earlier: boolean
    const turn = () => ({ messageId: 'm1', source: 'typed' as const, live: () => live })

    beforeEach(() => {
      closes = 0
      unfinished = () => []
      live = true
      earlier = false
      closeWithoutAsking = vi.fn(async (target: ManagedSession) => {
        closes += 1
        return { kind: 'close-session', computerId: target.computerId, sessionId: target.id, title: target.title, state: 'confirmed', decidedBy: 'oracle' }
      })
      Object.assign(host, {
        sessionClosePolicy: () => 'oracle-started',
        registry: () => started,
        unfinishedTaskSessions: () => unfinished(),
        autonomousClosesThisTurn: () => closes,
        backgroundTasks: vi.fn(async () => ({ tasks: [], runningCount: 0, supported: true })),
        closeWithoutAsking,
        callTurn: turn,
        earlierWorkRunning: () => earlier,
      })
    })

    it('closes an idle session it started, named by its full id, without asking', async () => {
      const result = await call('close_session', { sessionId: 'abc12345-aaaa', reason: 'Its PR merged.' })
      expect(closeWithoutAsking).toHaveBeenCalledWith(expect.objectContaining({ id: 'abc12345-aaaa' }), 'Its PR merged.')
      expect(host.requestCloseConfirmation).not.toHaveBeenCalled()
      expect(host.readSession).toHaveBeenCalledWith('hub', 'abc12345-aaaa')
      expect(String(result)).toContain('Closed "Session abc12345-aaaa" (abc12345-aaaa) without asking')
      expect(String(result)).toContain('reopen_session brings it back within 14 days')
    })

    it('asks instead, and says why, whenever a boundary is not met', async () => {
      const busy = (change: Partial<ManagedSession>) => () =>
        vi.mocked(host.readSession).mockResolvedValueOnce(session('abc12345-aaaa', change))
      const cases: Array<[string, () => void, string, string?]> = [
        ['shortened id', () => undefined, 'it was named by a shortened id', 'abc12345'],
        ['started by the user', () => Object.assign(host, { registry: () => ({}) }), 'it was not started by Oracle'],
        ['started by a schedule', () => Object.assign(host, { registry: () => ({
          'hub:abc12345-aaaa': { ...started['hub:abc12345-aaaa'], origin: 'schedule' },
        }) }), 'it was not started by Oracle'],
        ['turn cap', () => { closes = 5 }, 'Oracle already closed 5 sessions without asking this turn'],
        ['unreadable', () => vi.mocked(host.readSession).mockRejectedValueOnce(new Error('node offline')), 'its current state could not be read'],
        ['running', busy({ status: 'running' }), 'it is still running'],
        ['errored', busy({ status: 'error' }), 'it stopped with an error'],
        ['queued', busy({ queuedCount: 1 }), 'it has queued messages'],
        ['dispatching', busy({ queueState: { state: 'waiting', promptId: 'p', message: 'Waiting', updatedAt: 't' } }), 'it has queued messages'],
        ['failed prompt', busy({ failedPrompt: { content: 'x', failedAt: 't' } }), 'it holds a message that failed to send'],
        ['permission', busy({ status: 'waiting', pendingPermission: { requestId: 'p', title: 'Run', kind: 'shell', options: [] } }), 'it is waiting for an answer'],
        ['question', busy({ pendingUserInput: { requestId: 'q', question: 'Which?', choices: [], allowFreeform: true } }), 'it is waiting for an answer'],
        ['pinned', busy({ retention: { pinned: true } }), 'it is pinned'],
        ['interrupted', busy({ interruption: { detectedAt: 't', previousStatus: 'running' } }), 'it is recovering from a restart'],
        ['restart recovery', busy({ restartRecovery: { state: 'recovering', detectedAt: 't' } }), 'it is recovering from a restart'],
        ['recovery brief', busy({ recoverySeedState: 'pending' }), 'it is recovering from a restart'],
        ['background work', () => vi.mocked(host.backgroundTasks!).mockResolvedValueOnce({
          tasks: [
            { id: 'a', type: 'shell', description: 'Build', status: 'running', startedAt: 't', canCancel: true, executionMode: 'background' },
            { id: 'b', type: 'agent', description: 'Review', status: 'queued', startedAt: 't', canCancel: true },
            { id: 'c', type: 'shell', description: 'Lint', status: 'completed', startedAt: 't', canCancel: false },
          ],
          runningCount: 1,
          supported: true,
        }), 'it has 2 background tasks running or queued'],
        ['unreadable background work', () => vi.mocked(host.backgroundTasks!).mockRejectedValueOnce(new Error('offline')), 'its background tasks could not be read'],
        ['background work it cannot see', () => vi.mocked(host.backgroundTasks!).mockResolvedValueOnce({ tasks: [], runningCount: 0, supported: false }), 'its background tasks could not be read'],
        ['task in progress', () => { unfinished = () => [{ computerId: 'hub', sessionId: 'abc12345-aaaa' }] }, 'an unfinished Oracle task uses it'],
        ['unreadable tasks', () => { unfinished = () => { throw new Error('not ready') } }, 'Oracle tasks could not be read'],
        ['earlier work', () => { earlier = true }, 'Oracle may still be finishing work for an earlier message'],
        ['earlier work unknown', () => Object.assign(host, { earlierWorkRunning: undefined }), 'Oracle may still be finishing work for an earlier message'],
        ['outside a turn', () => Object.assign(host, { callTurn: () => undefined }), 'Oracle is no longer answering the message that asked for it'],
        ['stopped while it checked', () => vi.mocked(host.backgroundTasks!).mockImplementationOnce(async () => {
          live = false
          return { tasks: [], runningCount: 0, supported: true }
        }), 'Oracle is no longer answering the message that asked for it'],
      ]
      for (const [name, arrange, why, sessionId = 'abc12345-aaaa'] of cases) {
        vi.mocked(host.requestCloseConfirmation).mockClear()
        closes = 0
        unfinished = () => []
        live = true
        earlier = false
        Object.assign(host, { registry: () => started, callTurn: turn, earlierWorkRunning: () => earlier })
        arrange()
        const result = await call('close_session', { sessionId, reason: 'Done.' })
        expect(host.requestCloseConfirmation, name).toHaveBeenCalledWith(expect.objectContaining({ id: 'abc12345-aaaa' }), 'Done.', why)
        expect(String(result), name).toContain(`because ${why}`)
        expect(String(result), name).toContain('stays open until they confirm')
      }
      expect(closeWithoutAsking).not.toHaveBeenCalled()
    })

    it('asks when it cannot tell which tasks are unfinished', async () => {
      Object.assign(host, { unfinishedTaskSessions: undefined })
      await call('close_session', { sessionId: 'abc12345-aaaa' })
      expect(host.requestCloseConfirmation).toHaveBeenCalledWith(expect.objectContaining({ id: 'abc12345-aaaa' }), undefined, 'Oracle tasks could not be read')
      expect(closeWithoutAsking).not.toHaveBeenCalled()
    })

    it('reports a close that failed so Oracle can tell the user', async () => {
      closeWithoutAsking.mockResolvedValueOnce({
        kind: 'close-session', computerId: 'hub', sessionId: 'abc12345-aaaa', title: 'Session abc12345-aaaa', state: 'failed', error: 'node offline', decidedBy: 'oracle',
      })
      const result = await call('close_session', { sessionId: 'abc12345-aaaa' })
      expect(result).toMatchObject({ resultType: 'failure' })
      expect(JSON.stringify(result)).toContain('Could not close')
      expect(JSON.stringify(result)).toContain('node offline')
    })

    it('still asks with the ask policy, exactly as before', async () => {
      Object.assign(host, { sessionClosePolicy: () => 'ask' })
      const result = await call('close_session', { sessionId: 'abc12345-aaaa', reason: 'It finished.' })
      expect(host.requestCloseConfirmation).toHaveBeenCalledWith(expect.objectContaining({ id: 'abc12345-aaaa' }), 'It finished.')
      expect(String(result)).not.toContain('because')
      expect(closeWithoutAsking).not.toHaveBeenCalled()
    })
  })

  it('keeps notes in memory and reports a refused path as a failure', async () => {
    await call('memory_write', { path: 'MEMORY.md', content: '# Index' })
    await call('memory_append', { path: 'MEMORY.md', content: '- likes PRs' })
    expect(await call('memory_read', { path: 'MEMORY.md' })).toBe('# Index\n- likes PRs')
    expect(String(await call('memory_list', {}))).toContain('MEMORY.md')
    expect(activities.map((activity) => activity.content)).toEqual(['Updated memory: MEMORY.md', 'Updated memory: MEMORY.md'])

    const refused = await call('memory_write', { path: '../x.md', content: 'x' })
    expect(refused).toMatchObject({ resultType: 'failure' })
  })

  it('offers structured tools only with a ready store and enforces explicit intent', async () => {
    const structuredMemory = new ManagerStructuredMemoryStore(
      path.join(root, 'structured'),
    )
    await structuredMemory.initialize()
    const authorizeStructuredMemory = vi.fn(() => ({
      allowed: false,
      sourceManagerMessageId: 'manager-message-1',
    }))
    Object.assign(host, {
      structuredMemory,
      structuredMemoryScopes: () => [{ type: 'user' }],
      authorizeStructuredMemory,
    })
    tools = new Map(
      createManagerTools(host, (activity) => activities.push(activity))
        .map((tool) => [tool.name, tool]),
    )

    expect([...tools.keys()]).toEqual(expect.arrayContaining([
      'structured_memory_search',
      'structured_memory_remember',
      'structured_memory_correct',
      'structured_memory_forget',
    ]))
    const denied = await call('structured_memory_remember', {
      kind: 'preference',
      canonicalKey: 'pull request style',
      content: 'Keep pull request comments concise.',
      scope: { type: 'user' },
    }, 'remember-call')
    expect(denied).toMatchObject({ resultType: 'failure' })
    expect(JSON.stringify(denied)).toContain('explicitly ask')
    expect(structuredMemory.snapshot().records).toEqual([])

    authorizeStructuredMemory.mockReturnValue({
      allowed: true,
      sourceManagerMessageId: 'manager-message-1',
    })
    const remembered = await call('structured_memory_remember', {
      kind: 'preference',
      canonicalKey: 'pull request style',
      content: 'Keep pull request comments concise.',
      scope: { type: 'user' },
      confidence: 0.95,
    }, 'remember-call')
    expect(String(remembered)).toContain(structuredMemory.snapshot().records[0].id)
    expect(structuredMemory.snapshot().records).toHaveLength(1)
    expect(structuredMemory.snapshot().records[0].provenance)
      .toMatchObject({
        sourceManagerMessageId: 'manager-message-1',
      })
    expect(structuredMemory.snapshot().records[0].provenance.requestId)
      .toMatch(/^manager:[0-9a-f]{64}$/)
    expect(activities.at(-1)?.content).not.toContain('pull request style')

    await call('structured_memory_remember', {
      kind: 'preference',
      canonicalKey: 'pull request style',
      content: 'Keep pull request comments concise.',
      scope: { type: 'user' },
      confidence: 0.95,
    }, 'remember-call-retry')
    expect(structuredMemory.snapshot().records).toHaveLength(1)
  })

  it('searches, corrects, and forgets structured memory without exposing rejected values', async () => {
    const structuredMemory = new ManagerStructuredMemoryStore(
      path.join(root, 'structured'),
    )
    await structuredMemory.initialize()
    Object.assign(host, {
      structuredMemory,
      structuredMemoryScopes: () => [{ type: 'user' }],
      authorizeStructuredMemory: () => ({
        allowed: true,
        sourceManagerMessageId: 'manager-message-1',
      }),
    })
    tools = new Map(
      createManagerTools(host, (activity) => activities.push(activity))
        .map((tool) => [tool.name, tool]),
    )

    const secret = `ghp_${'A'.repeat(36)}`
    const rejected = await call('structured_memory_remember', {
      kind: 'fact',
      canonicalKey: 'credential',
      content: secret,
      scope: { type: 'user' },
    }, 'secret-call')
    expect(rejected).toMatchObject({ resultType: 'failure' })
    expect(JSON.stringify(rejected)).not.toContain(secret)

    await call('structured_memory_remember', {
      kind: 'preference',
      canonicalKey: 'pull request style',
      content: 'Keep pull request comments concise.',
      scope: { type: 'user' },
    }, 'remember-call')
    const original = structuredMemory.snapshot().records[0]
    const search = String(await call('structured_memory_search', {
      query: 'pull request style',
    }, 'search-call'))
    expect(search.length).toBeLessThanOrEqual(6_000)
    expect(search).toContain('Keep pull request comments concise.')

    await call('structured_memory_correct', {
      recordId: original.id,
      kind: 'preference',
      canonicalKey: 'pull request style',
      content: 'Use a single concise pull request comment.',
      scope: { type: 'user' },
    }, 'correct-call')
    const corrected = structuredMemory.snapshot().records.at(-1)!
    expect(corrected.supersedesId).toBe(original.id)

    await call('structured_memory_forget', {
      recordId: corrected.id,
    }, 'forget-call')
    expect(structuredMemory.search({
      query: 'pull request style',
      scopes: [{ type: 'user' }],
    }).records).toEqual([])

    const otherProject = await structuredMemory.remember({
      requestId: 'other-project-record',
      kind: 'fact',
      canonicalKey: 'deployment policy',
      content: 'Deploy the other project on Fridays.',
      scope: {
        type: 'project',
        computerId: 'hub',
        projectRoot: '/srv/other',
      },
    })
    const refusedForget = await call('structured_memory_forget', {
      recordId: otherProject.record!.id,
    }, 'forget-other-project')
    expect(refusedForget).toMatchObject({ resultType: 'failure' })
    expect(JSON.stringify(refusedForget)).toContain('outside the current')
    expect(structuredMemory.snapshot().tombstones).toHaveLength(1)
  })

  it('returns invalid arguments as a failure the model can correct', async () => {
    const result = await call('send_to_session', { sessionId: 'abc12345' })
    expect(result).toMatchObject({ resultType: 'failure' })
    expect(JSON.stringify(result)).toContain('message')
  })

  it('never acts on a session while answering an Ask only message, but still reads and asks', async () => {
    answerOnly = true
    source = 'typed'
    for (const [name, args] of [
      ['create_session', { title: 'X', prompt: 'Y' }],
      ['send_to_session', { sessionId: 'abc12345', message: 'hi' }],
      ['rename_session', { sessionId: 'abc12345', title: 'New' }],
      ['cancel_session', { sessionId: 'abc12345' }],
      ['close_session', { sessionId: 'abc12345' }],
      ['answer_session', { sessionId: 'abc12345', response: 'approve' }],
      ['reopen_session', { sessionId: 'old99999' }],
    ] as const) {
      const result = await call(name, args)
      expect(result, name).toMatchObject({ resultType: 'failure' })
      expect(JSON.stringify(result)).toContain('Ask mode')
      expect(JSON.stringify(result)).toContain('switching Oracle to Delegate')
    }
    expect(host.createSession).not.toHaveBeenCalled()
    expect(host.sendMessage).not.toHaveBeenCalled()
    expect(host.renameSession).not.toHaveBeenCalled()
    expect(host.cancel).not.toHaveBeenCalled()
    expect(host.requestCloseConfirmation).not.toHaveBeenCalled()
    expect(host.reopenSession).not.toHaveBeenCalled()
    expect(activities).toEqual([])
    // Reading, side questions, which fork the session's history rather than
    // prompt it, and Oracle's own memory leave running work alone.
    expect(String(await call('list_sessions', {}))).toContain('abc12345-aaaa')
    expect(String(await call('list_closed_sessions', {}))).toContain('old99999-cccc')
    expect(String(await call('get_session', { sessionId: 'abc12345' }))).toContain('message 11')
    expect(await call('ask_session', { sessionId: 'abc12345', question: 'What did you find?' }))
      .toBe('It fixed the bug and opened PR #12.')
    await call('memory_write', { path: 'MEMORY.md', content: '# Index' })
    expect(await call('memory_read', { path: 'MEMORY.md' })).toBe('# Index')
  })

  it('fails closed at the handler for every voice mutation class but permits read-only queries', async () => {
    await host.memory.write('MEMORY.md', '# Trusted')
    source = 'voice'
    answerOnly = true
    vi.mocked(host.readSession).mockResolvedValue(session('abc12345-aaaa', {
      status: 'waiting',
      pendingPermission: {
        requestId: 'perm-1',
        title: 'Run npm publish',
        kind: 'shell',
        options: [
          { optionId: 'allow', name: 'Allow once', kind: 'allow_once' },
          { optionId: 'deny', name: 'Deny', kind: 'reject_once' },
        ],
      },
    }))

    for (const [name, args] of [
      ['create_session', { title: 'X', prompt: 'Y' }],
      ['set_session_folder', { folder: '~/src/voice' }],
      ['send_to_session', { sessionId: 'abc12345', message: 'hi' }],
      ['rename_session', { sessionId: 'abc12345', title: 'New' }],
      ['answer_session', { sessionId: 'abc12345', response: 'approve' }],
      ['cancel_session', { sessionId: 'abc12345' }],
      ['close_session', { sessionId: 'abc12345' }],
      ['reopen_session', { sessionId: 'old99999' }],
      ['memory_write', { path: 'MEMORY.md', content: '# Replaced' }],
      ['memory_append', { path: 'MEMORY.md', content: '\n- planted' }],
      ['memory_delete', { path: 'MEMORY.md' }],
    ] as const) {
      const result = await call(name, args)
      expect(result, name).toMatchObject({ resultType: 'failure' })
      expect(JSON.stringify(result), name).toContain('voice')
    }

    expect(host.createSession).not.toHaveBeenCalled()
    expect(host.setSessionFolder).not.toHaveBeenCalled()
    expect(host.sendMessage).not.toHaveBeenCalled()
    expect(host.renameSession).not.toHaveBeenCalled()
    expect(host.replyPermission).not.toHaveBeenCalled()
    expect(host.replyUserInput).not.toHaveBeenCalled()
    expect(host.cancel).not.toHaveBeenCalled()
    expect(host.requestCloseConfirmation).not.toHaveBeenCalled()
    expect(host.reopenSession).not.toHaveBeenCalled()
    expect(await host.memory.read('MEMORY.md')).toBe('# Trusted')
    expect(oracleFolders).toEqual({})
    expect(activities).toEqual([])

    expect(String(await call('list_computers', {}))).toContain('development')
    expect(String(await call('list_models', {}))).toContain('model-a')
    expect(String(await call('list_sessions', {}))).toContain('abc12345-aaaa')
    expect(String(await call('list_closed_sessions', {}))).toContain('old99999-cccc')
    expect(host.reopenSession).not.toHaveBeenCalled()
    expect(String(await call('get_session', { sessionId: 'abc12345' })))
      .toContain('Run npm publish')
    expect(await call('ask_session', {
      sessionId: 'abc12345',
      question: 'What did you find?',
    })).toBe('It fixed the bug and opened PR #12.')
    expect(String(await call('list_skills', {}))).toContain('brainstorming')
    expect(String(await call('memory_list', {}))).toContain('MEMORY.md')
    expect(await call('memory_read', { path: 'MEMORY.md' })).toBe('# Trusted')
  })

  it('lets proactive turns record outcomes but refuses every other mutation', async () => {
    source = 'proactive'
    const eventId = 'a'.repeat(64)
    expect(await call('record_proactive_outcomes', {
      outcomes: [{
        kind: 'task',
        eventIds: [eventId],
        title: 'Run the focused queue test',
        summary: 'The queue regression needs execution.',
        nextAction: 'Start a session and run the focused test.',
        owner: 'oracle',
        executionPrompt: 'Reproduce the queue regression and run its focused test.',
      }],
    })).toContain('Recorded')

    const result = await call('create_session', { title: 'X', prompt: 'Y' })
    expect(result).toMatchObject({ resultType: 'failure' })
    expect(JSON.stringify(result)).toContain('proactive')
    expect(JSON.stringify(result)).toContain('read-only')
    expect(host.createSession).not.toHaveBeenCalled()
    proactiveSessionIds = new Set(['abc12345-aaaa'])
    for (const name of ['close_session', 'reopen_session']) {
      const refused = await call(name, { sessionId: 'abc12345' })
      expect(refused, name).toMatchObject({ resultType: 'failure' })
      expect(JSON.stringify(refused), name).toContain('read-only')
    }
    expect(host.requestCloseConfirmation).not.toHaveBeenCalled()
    expect(host.reopenSession).not.toHaveBeenCalled()
  })

  it('requires an execution prompt for every Oracle-owned proactive task', async () => {
    source = 'proactive'
    const result = await call('record_proactive_outcomes', {
      outcomes: [{
        kind: 'task',
        eventIds: ['b'.repeat(64)],
        title: 'Run the focused queue test',
        summary: 'The queue regression needs execution.',
        nextAction: 'Start a session and run its focused test.',
        owner: 'oracle',
      }],
    })

    expect(result).toMatchObject({ resultType: 'failure' })
    expect(JSON.stringify(result)).toContain('executionPrompt')
    expect(host.recordProactiveOutcomes).not.toHaveBeenCalled()
  })

  it('enforces the durable execution prompt limit for proactive tasks', async () => {
    source = 'proactive'
    const outcome = {
      kind: 'task' as const,
      eventIds: ['d'.repeat(64)],
      title: 'Run the focused queue test',
      summary: 'The queue regression needs execution.',
      nextAction: 'Start a session and run its focused test.',
      owner: 'oracle' as const,
    }

    expect(await call('record_proactive_outcomes', {
      outcomes: [{ ...outcome, executionPrompt: 'x'.repeat(4_000) }],
    })).toContain('Recorded')
    vi.mocked(host.recordProactiveOutcomes!).mockClear()

    const rejected = await call('record_proactive_outcomes', {
      outcomes: [{ ...outcome, executionPrompt: 'x'.repeat(4_001) }],
    })
    expect(rejected).toMatchObject({ resultType: 'failure' })
    expect(host.recordProactiveOutcomes).not.toHaveBeenCalled()
  })

  it('limits proactive transcript reads to sessions in the current batch', async () => {
    source = 'proactive'
    proactiveSessionIds = new Set(['abc12345-aaaa'])

    expect(String(await call('list_sessions', {}))).toContain('abc12345-aaaa')
    expect(String(await call('list_sessions', {}))).not.toContain('def67890-bbbb')
    expect(String(await call('get_session', { sessionId: 'abc12345' }))).toContain('message 11')
    expect(await call('ask_session', {
      sessionId: 'abc12345',
      question: 'What did you find?',
    })).toBe('It fixed the bug and opened PR #12.')

    for (const [name, args] of [
      ['get_session', { sessionId: 'def67890' }],
      ['ask_session', { sessionId: 'def67890', question: 'What did you find?' }],
    ] as const) {
      const result = await call(name, args)
      expect(result, name).toMatchObject({ resultType: 'failure' })
      expect(JSON.stringify(result), name).toContain('proactive batch')
    }
  })

  it('allows task execution tools only on sessions owned by the durable task', async () => {
    source = 'task'
    taskSessionIds = new Set(['def67890-bbbb'])
    expect(String(await call('create_session', {
      title: 'Task execution',
      prompt: 'Run the focused queue test.',
    }))).toContain('Started')
    vi.mocked(host.listSessions).mockResolvedValue([
      session('abc12345-aaaa'),
      session('def67890-bbbb', { status: 'running' }),
      session('new1', { cwd: '/home/me/src/web' }),
    ])
    expect(String(await call('send_to_session', {
      sessionId: 'def67890',
      message: 'Continue the focused queue test.',
    }))).toContain('Sent')
    expect(String(await call('send_to_session', {
      sessionId: 'new1',
      message: 'Run the focused assertion too.',
    }))).toContain('Sent')

    for (const [name, args] of [
      ['send_to_session', { sessionId: 'abc12345', message: 'Unrelated work.' }],
      ['answer_session', { sessionId: 'abc12345', response: 'approve' }],
      ['cancel_session', { sessionId: 'abc12345' }],
    ] as const) {
      const result = await call(name, args)
      expect(result, name).toMatchObject({ resultType: 'failure' })
      expect(JSON.stringify(result), name).toContain('durable task')
    }

    for (const [name, args] of [
      ['set_session_folder', { folder: '~/src/task' }],
      ['set_session_backend', { backend: 'terminal' }],
      ['rename_session', { sessionId: 'abc12345', title: 'Changed by task' }],
      ['close_session', { sessionId: 'abc12345' }],
      ['reopen_session', { sessionId: 'old99999' }],
      ['memory_write', { path: 'MEMORY.md', content: '# Task mutation' }],
      ['record_proactive_outcomes', { outcomes: [{
        kind: 'no-action',
        eventIds: ['c'.repeat(64)],
        reason: 'Not a proactive turn.',
      }] }],
    ] as const) {
      const result = await call(name, args)
      expect(result, name).toMatchObject({ resultType: 'failure' })
      expect(JSON.stringify(result), name).toContain('task')
    }
    expect(host.reopenSession).not.toHaveBeenCalled()
  })

  it('classifies unknown future tools as mutations so voice fails closed', () => {
    const classify = (
      managerToolsModule as typeof managerToolsModule & {
        managerToolMutability?: (name: string) => string
      }
    ).managerToolMutability
    expect(classify).toBeTypeOf('function')
    expect(classify?.('future_state_mutator')).toBe('mutation')
    expect(classify?.('list_sessions')).toBe('read')
  })

  it('leaves typed Delegate mutations unchanged', async () => {
    source = 'typed'
    answerOnly = false
    expect(String(await call('create_session', {
      title: 'Typed work',
      prompt: 'Do the typed task.',
    }))).toContain('Started')
    expect(host.createSession).toHaveBeenCalledOnce()
    expect(host.sendMessage).toHaveBeenCalledOnce()
  })

  it('lists computers, sessions, and skills', async () => {
    expect(String(await call('list_computers', {}))).toContain('production (node) · offline')
    const sessions = String(await call('list_sessions', { includeClosed: true }))
    expect(sessions).toContain('def67890-bbbb')
    expect(sessions).toContain('Recently closed')
    expect(sessions).toContain('old99999-cccc')
    expect(String(await call('list_skills', {}))).toContain('brainstorming — Explore intent before building')
  })

  describe('session categories', () => {
    const open = ['hub:abc12345-aaaa', 'hub:def67890-bbbb']
    const CATEGORY_TOOLS = ['create_category', 'delete_category', 'list_categories', 'move_sessions', 'rename_category']
    /** Every browser hears of a commit through these, as the hub routes tell them. */
    let told: SessionCategoriesSnapshot[]

    /** The hub's categories, changed through the same writer the hub gives Oracle. */
    async function categories(seed: SessionCategory[] = [], directory = path.join(root, 'hub')) {
      const order = new SessionOrderStore(directory)
      await order.initialize()
      await order.bootstrap({ hub: open })
      const store = new SessionCategoryStore(directory)
      await store.initialize()
      for (const { collapsed, ...category } of seed) {
        await store.change(store.snapshot().revision, { type: 'create', ...category })
        if (collapsed) {
          await store.change(store.snapshot().revision, { type: 'update', categoryId: category.id, collapsed: true })
        }
      }
      told = []
      store.on('changed', (snapshot) => told.push(snapshot))
      const writer = sessionCategoryWriter(store, order)
      host.sessionCategories = writer
      tools = new Map(createManagerTools(host, (activity) => activities.push(activity)).map((tool) => [tool.name, tool]))
      return { store, writer }
    }

    /** Another browser's change lands between Oracle reading the categories and changing them, `times` times. */
    function interfere(writer: SessionCategoryWriter, times = 1) {
      let left = times
      host.sessionCategories = {
        ...writer,
        change: async (revision, change) => {
          if (left > 0) {
            left -= 1
            const now = writer.snapshot()
            await writer.change(now.revision, { type: 'create', id: `other${left}`, name: `Other ${left}` })
          }
          return writer.change(revision, change)
        },
      }
      tools = new Map(createManagerTools(host, (activity) => activities.push(activity)).map((tool) => [tool.name, tool]))
    }

    const untouched = () => {
      for (const method of ['createSession', 'sendMessage', 'renameSession', 'reopenSession', 'cancel', 'requestCloseConfirmation'] as const) {
        expect(host[method], method).not.toHaveBeenCalled()
      }
    }

    const reviews: SessionCategory = { id: 'reviews', name: 'Reviews', collapsed: false, sessions: open }

    it('offers the category tools only on a hub that keeps categories, reading among the read-only ones', async () => {
      expect(CATEGORY_TOOLS.filter((name) => tools.has(name))).toEqual([])
      await categories()
      expect(CATEGORY_TOOLS.filter((name) => tools.has(name))).toEqual(CATEGORY_TOOLS)
      expect(CATEGORY_TOOLS.map((name) => managerToolsModule.managerToolMutability(name))).toEqual([
        'mutation', 'mutation', 'read', 'mutation', 'mutation',
      ])
    })

    it('lists the categories in order with each session\'s computer, id, and title', async () => {
      await categories([
        reviews,
        { id: 'plans', name: 'Plans', collapsed: true, sessions: ['hub:old99999-cccc', 'hub:gone'] },
      ])
      const listed = String(await call('list_categories', {}))
      expect(listed).toBe([
        'Categories (2), top to bottom as the Sessions list shows them:',
        '1. "Reviews" (id reviews) · expanded · 2 sessions',
        '   - abc12345-aaaa · development (hub) · "Session abc12345-aaaa"',
        '   - def67890-bbbb · development (hub) · "Session def67890-bbbb"',
        '2. "Plans" (id plans) · collapsed · 2 sessions',
        '   - old99999-cccc · development (hub) · "Session old99999-cccc" · closed; back here if reopened',
        '   - gone · development (hub) · not in the session list',
        'Open sessions in no category: 0. They are listed under their computers.',
      ].join('\n'))
      expect(told).toEqual([])
      untouched()
    })

    it('says there are none, and how many sessions are in none', async () => {
      await categories()
      expect(await call('list_categories', {})).toBe(
        'There are no categories. Open sessions in no category: 2. They are listed under their computers.',
      )
    })

    it('creates a category, at a position when asked, and every browser hears of it', async () => {
      const { store } = await categories([reviews])
      const created = String(await call('create_category', { name: '  Field   work ' }))
      const fieldWork = store.snapshot().categories[1]
      expect(fieldWork).toMatchObject({ name: 'Field work', collapsed: false, sessions: [] })
      expect(created).toBe(`Created category "Field work" (id ${fieldWork.id}) at position 2 of 2; move sessions into it with move_sessions.`)
      expect(String(await call('create_category', { name: 'Urgent', position: 1 }))).toContain('at position 1 of 3')
      expect(store.snapshot().categories.map(({ name }) => name)).toEqual(['Urgent', 'Reviews', 'Field work'])
      expect(told).toEqual([
        { revision: 2, categories: [reviews, fieldWork] },
        store.snapshot(),
      ])
      expect(activities).toEqual([
        { tool: 'create_category', content: 'Created category "Field work"' },
        { tool: 'create_category', content: 'Created category "Urgent"' },
      ])
      // A name taken in another case is refused, and nothing is committed.
      expect(await call('create_category', { name: 'reviews' })).toMatchObject({
        resultType: 'failure', error: 'A category named reviews already exists',
      })
      expect(told).toHaveLength(2)
      untouched()
    })

    it('renames a category named by its id or its name, in any case', async () => {
      const { store } = await categories([reviews])
      expect(await call('rename_category', { category: 'REVIEWS', name: 'Code reviews' }))
        .toBe('Renamed category "Reviews" to "Code reviews" (id reviews).')
      expect(await call('rename_category', { category: 'reviews', name: 'Code reviews' }))
        .toBe('Category "Code reviews" (id reviews) already has that name; nothing changed.')
      expect(store.snapshot().categories).toEqual([{ ...reviews, name: 'Code reviews' }])
      expect(told).toEqual([store.snapshot()])
      expect(activities).toEqual([{ tool: 'rename_category', content: 'Renamed category "Reviews" to "Code reviews"' }])
      untouched()
    })

    it('deletes a category, and its sessions stay open where they were, under their computers', async () => {
      const { store } = await categories([reviews, { id: 'plans', name: 'Plans', collapsed: false, sessions: [] }])
      expect(await call('delete_category', { category: 'Reviews' })).toBe(
        'Deleted category "Reviews" (id reviews); its 2 sessions are unchanged, listed under their computers again.',
      )
      expect(await call('delete_category', { category: 'plans' }))
        .toBe('Deleted category "Plans" (id plans); it held no sessions.')
      expect(store.snapshot()).toEqual({ revision: 4, categories: [] })
      expect(told.map(({ revision }) => revision)).toEqual([3, 4])
      expect(activities.map(({ content }) => content)).toEqual([
        'Deleted category "Reviews"; its 2 sessions stay', 'Deleted category "Plans"',
      ])
      untouched()
    })

    it('moves sessions into a category at a position, and out of their categories again', async () => {
      const { store } = await categories([{ id: 'plans', name: 'Plans', collapsed: false, sessions: [] }, { ...reviews, sessions: [] }])
      await store.change(2, { type: 'move', sessions: ['hub:abc12345-aaaa'], categoryId: 'plans' })
      told = []
      const moved = String(await call('move_sessions', {
        sessionIds: ['def67890', 'abc12345-aaaa'], category: 'reviews', position: 1,
      }))
      expect(moved).toBe(
        'Moved 2 sessions into "Reviews" (id reviews): [Session def67890-bbbb](?computer=hub&session=def67890-bbbb), ' +
        '[Session abc12345-aaaa](?computer=hub&session=abc12345-aaaa). Only where they are listed changed.',
      )
      expect(store.snapshot().categories.map(({ id, sessions }) => [id, sessions])).toEqual([
        ['plans', []], ['reviews', ['hub:def67890-bbbb', 'hub:abc12345-aaaa']],
      ])
      expect(await call('move_sessions', { sessionIds: ['def67890-bbbb', 'abc12345-aaaa'], category: 'Reviews' }))
        .toBe('Nothing changed: those sessions are already there.')
      expect(await call('move_sessions', { sessionIds: ['def67890-bbbb'], category: null })).toBe(
        'Took 1 session out of its category; it is listed under its computer again: ' +
        '[Session def67890-bbbb](?computer=hub&session=def67890-bbbb).',
      )
      expect(store.snapshot().categories[1].sessions).toEqual(['hub:abc12345-aaaa'])
      expect(told).toHaveLength(2)
      expect(activities.map(({ tool, content }) => [tool, content])).toEqual([
        ['move_sessions', 'Moved 2 sessions into "Reviews"'],
        ['move_sessions', 'Took 1 session out of its category'],
      ])
      untouched()
    })

    it.each([
      ['create_category', { name: 'Ideas', position: 1 }, (names: string[]) => expect(names[0]).toBe('Ideas')],
      ['rename_category', { category: 'Reviews', name: 'Code reviews' }, (names: string[]) => expect(names).toContain('Code reviews')],
      ['delete_category', { category: 'reviews' }, (names: string[]) => expect(names).not.toContain('Reviews')],
      ['move_sessions', { sessionIds: ['abc12345'], category: null }, () => undefined],
    ] as const)('makes %s again against the categories as they stand when another change lands first', async (name, args, check) => {
      const { store, writer } = await categories([reviews])
      interfere(writer)
      const result = await call(name, args)
      expect(typeof result, JSON.stringify(result)).toBe('string')
      const names = store.snapshot().categories.map((category) => category.name)
      expect(names).toContain('Other 0')
      check(names)
      if (name === 'move_sessions') expect(store.snapshot().categories[0].sessions).toEqual(['hub:def67890-bbbb'])
      // Every commit reached the browsers: the other change and Oracle's.
      expect(told).toEqual([expect.anything(), store.snapshot()])
    })

    it.each([
      ['create_category', { name: 'Ideas' }],
      ['rename_category', { category: 'Reviews', name: 'Code reviews' }],
      ['delete_category', { category: 'reviews' }],
      ['move_sessions', { sessionIds: ['abc12345'], category: null }],
    ] as const)('tries %s only once more when the categories keep changing', async (name, args) => {
      const { store, writer } = await categories([reviews])
      interfere(writer, 2)
      expect(await call(name, args)).toMatchObject({
        resultType: 'failure',
        error: 'The categories changed again while this ran, so nothing changed. Read them with list_categories and try again.',
      })
      expect(store.snapshot().categories.map(({ id, name: named, sessions }) => [id, named, sessions])).toEqual([
        ['reviews', 'Reviews', open], ['other1', 'Other 1', []], ['other0', 'Other 0', []],
      ])
    })

    it('refuses plainly while the hub cannot use its categories, and leaves their file alone', async () => {
      const directory = path.join(root, 'newer')
      await mkdir(directory, { recursive: true })
      const file = path.join(directory, 'session-categories.json')
      await writeFile(file, JSON.stringify({ version: 2, revision: 4, categories: [] }))
      const { store } = await categories([], directory)
      const reason = store.unavailableReason()!
      expect(reason).toMatch(/newer release/)
      for (const [name, args] of [
        ['list_categories', {}],
        ['create_category', { name: 'Ideas' }],
        ['rename_category', { category: 'Reviews', name: 'Code reviews' }],
        ['delete_category', { category: 'reviews' }],
        ['move_sessions', { sessionIds: ['abc12345'], category: 'reviews' }],
      ] as const) {
        expect(await call(name, args), name).toMatchObject({
          resultType: 'failure', error: `Categories are unavailable on this hub: ${reason}`,
        })
      }
      expect(JSON.parse(await readFile(file, 'utf8'))).toEqual({ version: 2, revision: 4, categories: [] })
      expect(told).toEqual([])
    })

    it('names what it cannot find: a category, a session, or a session the list does not hold', async () => {
      const { store } = await categories([reviews, { id: 'plans', name: 'Plans', collapsed: false, sessions: [] }])
      const choices = 'Categories: "Reviews" (id reviews), "Plans" (id plans).'
      for (const [name, args, given] of [
        ['rename_category', { category: 'Ideas', name: 'New ideas' }, 'Ideas'],
        ['delete_category', { category: 'ideas' }, 'ideas'],
        ['move_sessions', { sessionIds: ['abc12345'], category: 'Ideas' }, 'Ideas'],
      ] as const) {
        expect(await call(name, args), name).toMatchObject({
          resultType: 'failure', error: `No category is named or has the id "${given}". ${choices}`,
        })
      }
      expect(await call('move_sessions', { sessionIds: ['abc12345', 'zzz99999'], category: 'plans' })).toMatchObject({
        resultType: 'failure', error: 'No open session matches zzz99999. Check the roster or call list_sessions.',
      })
      expect(await call('move_sessions', { sessionIds: ['abc12345'], category: null, position: 1 })).toMatchObject({
        resultType: 'failure', error: 'position applies only when moving sessions into a category.',
      })
      // Open, but not yet in the list every browser shows, so not placed.
      vi.mocked(host.listSessions).mockResolvedValueOnce([session('abc12345-aaaa'), session('fresh000-dddd')])
      expect(await call('move_sessions', { sessionIds: ['fresh000-dddd'], category: 'plans' })).toMatchObject({
        resultType: 'failure', error: expect.stringContaining('hub:fresh000-dddd is not in the session list'),
      })
      expect(told).toEqual([])
      expect(store.snapshot().revision).toBe(2)
      // With none at all, it says so.
      await call('delete_category', { category: 'reviews' })
      await call('delete_category', { category: 'plans' })
      expect(await call('rename_category', { category: 'Ideas', name: 'New ideas' })).toMatchObject({
        resultType: 'failure', error: 'No category is named or has the id "Ideas". There are no categories; create_category makes one.',
      })
    })

    it.each([
      ['an Ask message', 'typed', true, 'Ask mode'],
      ['a voice turn', 'voice', true, 'voice'],
      ['a proactive observation', 'proactive', false, 'proactive'],
      ['a task turn', 'task', false, 'task'],
    ] as const)('organizes nothing for %s, but still lists the categories', async (_label, kind, ask, said) => {
      const { store } = await categories([reviews])
      source = kind
      answerOnly = ask
      proactiveSessionIds = new Set(['abc12345-aaaa'])
      for (const [name, args] of [
        ['create_category', { name: 'Ideas' }],
        ['rename_category', { category: 'Reviews', name: 'Code reviews' }],
        ['delete_category', { category: 'reviews' }],
        ['move_sessions', { sessionIds: ['abc12345'], category: null }],
      ] as const) {
        const result = await call(name, args)
        expect(result, name).toMatchObject({ resultType: 'failure' })
        expect(JSON.stringify(result), name).toContain(said)
      }
      const listed = String(await call('list_categories', {}))
      expect(listed).toContain('"Reviews" (id reviews)')
      // A proactive observation reads only the sessions in it.
      if (kind === 'proactive') {
        expect(listed).toContain('abc12345-aaaa')
        expect(listed).not.toContain('def67890-bbbb')
        expect(listed).toContain('   - 1 more, outside this observation')
      }
      expect(store.snapshot().revision).toBe(1)
      expect(told).toEqual([])
    })
  })
})
