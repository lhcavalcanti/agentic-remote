import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComputerSummary, ManagedSession } from '../shared/contracts.js'
import { ManagerMemory } from './manager-memory.js'
import {
  createManagerTools,
  type ManagerTool,
  type ManagerToolActivity,
  type ManagerToolHost,
} from './manager-tools.js'

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
  let oracleFolders: Record<string, string>

  const call = async (name: string, args: unknown) => {
    const tool = tools.get(name)
    if (!tool) throw new Error(`no tool ${name}`)
    return tool.handler(args, { sessionId: 'manager', toolCallId: 't', toolName: name, arguments: args })
  }

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'manager-tools-'))
    activities = []
    answerOnly = false
    oracleFolders = {}
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
      queueBatch: vi.fn(async (_computerId: string, id: string, input: { batchId: string; prompts: string[] }) => ({
        session: session(id, { queuedCount: input.prompts.length }),
        batch: { id: input.batchId, promptIds: input.prompts.map((_, index) => `item-${index}`), duplicate: false },
      })),
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
      sessionFolders: () => oracleFolders,
      setSessionFolder: vi.fn(async (computerId: string, folder?: string) => {
        if (folder === '~/missing') throw new Error('Folder does not exist')
        const normalized = folder?.replace(/^~/, '/home/me')
        if (normalized) oracleFolders = { ...oracleFolders, [computerId]: normalized }
        else oracleFolders = Object.fromEntries(Object.entries(oracleFolders).filter(([id]) => id !== computerId))
        return normalized
      }),
      memory: new ManagerMemory(path.join(root, 'memory')),
      defaults: () => ({ computerId: 'hub', mode: 'autopilot', provider: 'copilot', model: 'gpt-6-sol', folders: { hub: '~/src/web' } }),
      now: () => new Date('2026-10-15T12:00:00.000Z'),
    }
    tools = new Map(createManagerTools(host, (activity) => activities.push(activity), { pollMs: 1, trustWaitMs: 40 })
      .map((tool) => [tool.name, tool]))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('offers only management tools, none of which prompt for permission', () => {
    expect([...tools.keys()].sort()).toEqual([
      'answer_session', 'ask_session', 'cancel_session', 'close_session', 'create_session', 'get_session',
      'list_computers', 'list_sessions', 'list_skills', 'memory_append', 'memory_delete',
      'memory_list', 'memory_read', 'memory_write', 'queue_prompts', 'rename_session', 'send_to_session',
      'set_session_folder',
    ])
    for (const tool of tools.values()) {
      expect(tool.skipPermission).toBe(true)
      expect(tool.parameters).toMatchObject({ type: 'object' })
      expect(tool.description?.length).toBeGreaterThan(20)
    }
  })

  it('starts a session from the user defaults, names it, hands it the task, and reports it', async () => {
    const result = await call('create_session', { title: 'Fix "login"\nbug', prompt: 'Fix the login bug. Use the systematic-debugging skill.' })

    expect(host.createSession).toHaveBeenCalledWith('hub', {
      cwd: '~/src/web', provider: 'copilot', terminalBacked: true, allowAllPermissions: true,
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
    expect(host.sendMessage).toHaveBeenCalledWith('hub', 'def67890-bbbb', 'Also add tests')
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
      'Started "LLM lab" on development',
      'Trusted /home/me/src/llmlab for "LLM lab"',
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

  it('queues several prompts on any session in one step, each its own turn', async () => {
    const result = String(await call('queue_prompts', {
      sessionId: 'def67890', prompts: ['Write the migration', 'Then run the tests', 'Then open a PR'],
    }))
    expect(host.queueBatch).toHaveBeenCalledExactlyOnceWith('hub', 'def67890-bbbb', {
      batchId: expect.stringMatching(/^oracle-[a-f0-9]{32}$/),
      prompts: ['Write the migration', 'Then run the tests', 'Then open a PR'],
    })
    expect(host.sendMessage).not.toHaveBeenCalled()
    expect(result).toContain('Queued 3 prompts')
    expect(activities.at(-1)).toMatchObject({ tool: 'queue_prompts', content: 'Queued 3 prompts on "Session def67890-bbbb"' })

    // A closed session is reopened and a suspended one resumed first, as for send_to_session.
    await call('queue_prompts', { sessionId: 'old99999', prompts: ['Pick this back up', 'Then summarise'] })
    expect(host.reopenSession).toHaveBeenCalledWith('hub', 'old99999-cccc')

    for (const prompts of [[], ['ok', ' '], Array.from({ length: 51 }, () => 'p')]) {
      expect(await call('queue_prompts', { sessionId: 'def67890', prompts })).toMatchObject({ resultType: 'failure' })
    }
    vi.mocked(host.queueBatch as never as (...args: unknown[]) => Promise<unknown>).mockRejectedValueOnce(
      Object.assign(new Error('Resume the session before queueing to it. Nothing was queued.'), { statusCode: 409 }),
    )
    expect(JSON.stringify(await call('queue_prompts', { sessionId: 'def67890', prompts: ['x'] })))
      .toContain('Nothing was queued')
    vi.mocked(host.listSessions).mockResolvedValue([session('abc12345-aaaa', { suspended: true })])
    await call('queue_prompts', { sessionId: 'abc12345', prompts: ['Carry on'] })
    expect(host.resumeSession).toHaveBeenCalledWith('hub', 'abc12345-aaaa')
    answerOnly = true
    expect(await call('queue_prompts', { sessionId: 'abc12345', prompts: ['x'] })).toMatchObject({ resultType: 'failure' })
    expect(host.queueBatch).toHaveBeenCalledTimes(4)
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

  it('returns invalid arguments as a failure the model can correct', async () => {
    const result = await call('send_to_session', { sessionId: 'abc12345' })
    expect(result).toMatchObject({ resultType: 'failure' })
    expect(JSON.stringify(result)).toContain('message')
  })

  it('never acts on a session while answering an Ask only message, but still reads and asks', async () => {
    answerOnly = true
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

  it('lists computers, sessions, and skills', async () => {
    expect(String(await call('list_computers', {}))).toContain('production (node) · offline')
    const sessions = String(await call('list_sessions', { includeClosed: true }))
    expect(sessions).toContain('def67890-bbbb')
    expect(sessions).toContain('Recently closed')
    expect(sessions).toContain('old99999-cccc')
    expect(String(await call('list_skills', {}))).toContain('brainstorming — Explore intent before building')
  })
})
