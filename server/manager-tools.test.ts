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
    tools = new Map(createManagerTools(host, (activity) => activities.push(activity)).map((tool) => [tool.name, tool]))
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('offers only management tools, none of which prompt for permission', () => {
    expect([...tools.keys()].sort()).toEqual([
      'ask_session', 'cancel_session', 'close_session', 'create_session', 'get_session',
      'list_computers', 'list_sessions', 'list_skills', 'memory_append', 'memory_delete',
      'memory_list', 'memory_read', 'memory_write', 'rename_session', 'send_to_session',
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
