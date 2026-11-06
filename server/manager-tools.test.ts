import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComputerSummary, ManagedSession } from '../shared/contracts.js'
import type { ManagerMessageSource, ManagerSessionBackend } from '../shared/manager.js'
import { ManagerMemory } from './manager-memory.js'
import { ManagerStructuredMemoryStore } from './manager-structured-memory-store.js'
import {
  createManagerTools,
  type ManagerTool,
  type ManagerToolActivity,
  type ManagerToolHost,
} from './manager-tools.js'
import * as managerToolsModule from './manager-tools.js'

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
    const created = session('new1', { cwd: '/home/me/src/web' })
    host = {
      computers: () => computers,
      findComputer: (nameOrId) => computers.find((computer) => computer.id === nameOrId || computer.name === nameOrId),
      listSessions: vi.fn(async () => [session('abc12345-aaaa'), session('def67890-bbbb', { status: 'running' })]),
      listHistory: vi.fn(async () => [session('old99999-cccc', { isOpen: false })]),
      readSession: vi.fn(async (_computerId: string, id: string) => session(id, {
        messages: Array.from({ length: 12 }, (_, index) => ({
          id: `${index}`, role: index % 2 ? 'assistant' : 'user', content: `message ${index} ${'x'.repeat(index === 11 ? 3000 : 1)}`, createdAt: 't',
        })),
      })),
      askSession: vi.fn(async () => 'It fixed the bug and opened PR #12.'),
      createSession: vi.fn(async () => created),
      renameSession: vi.fn(async (_computerId: string, id: string, title: string) => session(id, { title })),
      sendMessage: vi.fn(async (_computerId: string, id: string) => session(id)),
      replyPermission: vi.fn(async (_computerId: string, id: string) => session(id)),
      replyUserInput: vi.fn(async (_computerId: string, id: string) => session(id)),
      reopenSession: vi.fn(async (_computerId: string, id: string) => session(id)),
      resumeSession: vi.fn(async (_computerId: string, id: string) => session(id)),
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
      defaults: () => ({ computerId: 'hub', mode: 'autopilot', provider: 'copilot', model: 'gpt-6-sol', folders: { hub: '~/src/web' } }),
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

  it('offers only management tools, none of which prompt for permission', () => {
    expect([...tools.keys()].sort()).toEqual([
      'answer_session', 'ask_session', 'cancel_session', 'close_session', 'create_session', 'get_session',
      'list_computers', 'list_sessions', 'list_skills', 'memory_append', 'memory_delete',
      'memory_list', 'memory_read', 'memory_write', 'record_proactive_outcomes',
      'rename_session', 'send_to_session', 'set_session_backend', 'set_session_folder',
    ])
    for (const tool of tools.values()) {
      expect(tool.skipPermission).toBe(true)
      expect(tool.parameters).toMatchObject({ type: 'object' })
      expect(tool.description?.length).toBeGreaterThan(20)
    }
  })

  it('starts a session from the user defaults, names it, hands it the task, and reports it', async () => {
    const result = await call('create_session', { title: 'Fix "login"\nbug', prompt: 'Fix the login bug. Use the systematic-debugging skill.' })

    // Oracle opens its sessions with the Copilot SDK unless its setting says a terminal.
    expect(host.createSession).toHaveBeenCalledWith('hub', {
      cwd: '~/src/web', provider: 'copilot', terminalBacked: false, allowAllPermissions: true,
      mode: 'autopilot', model: 'gpt-6-sol',
    })
    expect(host.renameSession).toHaveBeenCalledWith('hub', 'new1', "Fix 'login' bug")
    expect(host.markManaged).toHaveBeenCalledWith(expect.objectContaining({ id: 'new1' }), 'Fix the login bug. Use the systematic-debugging skill.')
    expect(host.sendMessage).toHaveBeenCalledWith('hub', 'new1', 'Fix the login bug. Use the systematic-debugging skill.')
    expect(String(result)).toContain('new1')
    expect(String(result)).toContain('?computer=hub&session=new1')
    expect(activities).toEqual([{
      tool: 'create_session',
      content: 'Started "Fix \'login\' bug" on development',
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

  it('uses an SDK session for a provider without tmux and drops a model meant for another provider', async () => {
    await call('create_session', { title: 'Review', prompt: 'Review it', provider: 'claude', cwd: '/srv/x' })
    expect(host.createSession).toHaveBeenCalledWith('hub', {
      cwd: '/srv/x', provider: 'claude', terminalBacked: false, allowAllPermissions: true, mode: 'autopilot',
    })
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
      'Started "LLM lab" on development',
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

  it('reopens a closed session and resumes a suspended one to steer it', async () => {
    expect(String(await call('send_to_session', { sessionId: 'old99999', message: 'Pick this back up.' }))).toContain('Sent')
    expect(host.reopenSession).toHaveBeenCalledWith('hub', 'old99999-cccc')
    expect(host.sendMessage).toHaveBeenLastCalledWith('hub', 'old99999-cccc', 'Pick this back up.')
    expect(activities.map((activity) => activity.content)).toEqual([
      'Reopened "Session old99999-cccc"',
      'Sent a message to "Session old99999-cccc"',
    ])
    vi.mocked(host.listSessions).mockResolvedValue([session('abc12345-aaaa', { suspended: true })])
    await call('send_to_session', { sessionId: 'abc12345', message: 'Carry on.' })
    expect(host.resumeSession).toHaveBeenCalledWith('hub', 'abc12345-aaaa')
    expect(host.sendMessage).toHaveBeenLastCalledWith('hub', 'abc12345-aaaa', 'Carry on.')
  })

  it('only asks the user to close a session and never closes one itself', async () => {
    const result = await call('close_session', { sessionId: 'abc12345', userConfirmed: true, reason: 'It finished.' })
    expect(host.requestCloseConfirmation).toHaveBeenCalledWith(expect.objectContaining({ id: 'abc12345-aaaa' }), 'It finished.')
    expect(String(result)).toContain('stays open until they confirm')
    expect(Object.keys(host)).not.toContain('deleteSession')
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
    expect(activities).toEqual([])
    // Reading, side questions, which fork the session's history rather than
    // prompt it, and Oracle's own memory leave running work alone.
    expect(String(await call('list_sessions', {}))).toContain('abc12345-aaaa')
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
    expect(await host.memory.read('MEMORY.md')).toBe('# Trusted')
    expect(oracleFolders).toEqual({})
    expect(activities).toEqual([])

    expect(String(await call('list_computers', {}))).toContain('development')
    expect(String(await call('list_sessions', {}))).toContain('abc12345-aaaa')
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
})
