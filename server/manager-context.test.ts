import { describe, expect, it } from 'vitest'
import type { ComputerSummary, ManagedSession } from '../shared/contracts.js'
import {
  buildTurnContext,
  managerPrompt,
  MANAGER_SYSTEM_PROMPT,
  recoveryBrief,
  rosterLine,
} from './manager-context.js'
import type { JournalEntry, ManagerRegistry } from './manager-store.js'

const now = new Date('2026-10-15T12:00:00.000Z')

const computers: ComputerSummary[] = [
  { id: 'hub', name: 'development', isLocal: true, online: true },
  { id: 'node', name: 'production', isLocal: false, online: false },
]

function session(id: string, change: Partial<ManagedSession> = {}): ManagedSession {
  return {
    id,
    computerId: 'hub',
    computerName: 'development',
    cwd: '/home/me/src/app',
    title: `Session ${id}`,
    status: 'idle',
    updatedAt: '2026-10-15T11:55:00.000Z',
    isOpen: true,
    provider: 'copilot',
    messages: [],
    ...change,
  }
}

function entry(seq: number, change: Partial<JournalEntry>): JournalEntry {
  return { seq, at: '2026-10-15T11:00:00.000Z', kind: 'status', computerId: 'hub', sessionId: 'a', ...change }
}

describe('manager turn context', () => {
  it('describes a session on one line with what it is doing', () => {
    const line = rosterLine(
      session('abc', {
        title: 'Fix\nlogin',
        status: 'running',
        activity: 'Running tests',
        runtime: { mode: 'autopilot' },
      }),
      { computerId: 'hub', sessionId: 'abc', title: 'x', origin: 'manager', firstSeenAt: 't', task: 'Fix the login bug' },
      now,
    )
    expect(line).toBe(
      '- abc · development (hub) · "Fix login" · running · copilot/autopilot · /home/me/src/app · updated 5m ago · started by you (manager) · task: Fix the login bug · doing: Running tests',
    )
  })

  it('flags sessions waiting for the user and shows the latest reply when idle', () => {
    expect(rosterLine(session('w', { status: 'waiting', pendingUserInput: { requestId: 'r', question: 'Which DB?' } as never }), undefined, now))
      .toContain('· waiting for the user (question)')
    const idle = rosterLine(session('i', {
      messages: [
        { id: '1', role: 'user', content: 'go', createdAt: 't' },
        { id: '2', role: 'assistant', content: `Done.\nAll ${'tests '.repeat(40)}pass`, createdAt: 't' },
      ],
    }), undefined, now)
    expect(idle).toMatch(/· last reply: Done\. All tests/)
    expect(idle.length).toBeLessThan(400)
  })

  it('orders attention first, caps the roster, and lists computers', () => {
    const sessions = [
      session('quiet', { updatedAt: '2026-10-15T10:00:00.000Z' }),
      session('busy', { status: 'running' }),
      session('stuck', { status: 'waiting' }),
      ...Array.from({ length: 5 }, (_, index) => session(`extra${index}`)),
    ]
    const context = buildTurnContext({
      now, computers, sessions, registry: {}, changes: [], rosterLimit: 4,
    })
    expect(context).toContain('Computers: development (hub, this hub, online) · production (node, offline)')
    const lines = context.split('\n').filter((line) => line.startsWith('- '))
    expect(lines[0]).toContain('stuck')
    expect(lines[1]).toContain('busy')
    expect(lines).toHaveLength(4)
    expect(context).toContain('…and 4 more open sessions; call list_sessions to see them.')
    expect(context).toContain('Open sessions (8):')
  })

  it('collapses status churn and asks for memory upkeep after removals', () => {
    const registry: ManagerRegistry = {
      'hub:a': { computerId: 'hub', sessionId: 'a', title: 'Alpha', origin: 'manager', firstSeenAt: 't' },
      'hub:gone': { computerId: 'hub', sessionId: 'gone', title: 'Gone', origin: 'user', firstSeenAt: 't', removedAt: 't' },
    }
    const context = buildTurnContext({
      now,
      computers,
      sessions: [session('a', { title: 'Alpha' })],
      registry,
      changes: [
        entry(1, { kind: 'created', sessionId: 'a', title: 'Alpha', computerName: 'development' }),
        entry(2, { from: 'idle', to: 'running', title: 'Alpha' }),
        entry(3, { from: 'running', to: 'waiting', title: 'Alpha' }),
        entry(4, { from: 'waiting', to: 'idle', title: 'Alpha' }),
        entry(5, { kind: 'removed', sessionId: 'gone', title: 'Gone' }),
        entry(6, { kind: 'replaced', sessionId: 'old', replacedBy: 'new', title: 'Old' }),
      ],
    })
    expect(context).toContain('- 11:00 created "Alpha" (a on development) by you (manager)')
    expect(context).toContain('- 11:00 "Alpha" (a): idle → running → waiting → idle')
    expect(context).toContain('- 11:00 removed "Gone" (gone): the session was deleted. Fold its outcomes into MEMORY.md and delete memory/sessions/gone.md if you kept one.')
    expect(context).toContain('- 11:00 cleared "Old" (old): it continues as new')
  })

  it('reports no changes plainly and includes memory and notes only when given', () => {
    const plain = buildTurnContext({ now, computers, sessions: [], registry: {}, changes: [] })
    expect(plain).toContain('Changes since your last turn: none')
    expect(plain).toContain('Open sessions (0): none')
    expect(plain).not.toContain('MEMORY.md')

    const full = buildTurnContext({
      now, computers, sessions: [], registry: {}, changes: [],
      memoryIndex: '# Prefs\n- PRs over pushes', notes: ['Your previous turn was interrupted.'],
    })
    expect(full).toContain('Your memory index (MEMORY.md):\n# Prefs\n- PRs over pushes')
    expect(full).toContain('Notes:\n- Your previous turn was interrupted.')
    expect(full.startsWith('<agentic_remote_context generated="2026-10-15T12:00:00.000Z">')).toBe(true)
    expect(full.endsWith('</agentic_remote_context>')).toBe(true)
  })

  it('wraps the user message after the context', () => {
    expect(managerPrompt('<ctx/>', 'What is running?')).toBe('<ctx/>\n\n<user_message>\nWhat is running?\n</user_message>')
  })

  it('briefs a fresh conversation from memory and the latest exchanges', () => {
    const brief = recoveryBrief({
      memoryIndex: '# Index',
      messages: [
        { id: '1', role: 'user', content: 'Start the docs work', createdAt: 't' },
        { id: '2', role: 'activity', content: 'Started session "Docs"', createdAt: 't', tool: 'create_session' },
        { id: '3', role: 'assistant', content: 'Started it.', createdAt: 't' },
      ],
    })
    expect(brief).toContain('# Index')
    expect(brief).toContain('User: Start the docs work')
    expect(brief).toContain('Action: Started session "Docs"')
    expect(brief).toContain('You: Started it.')
  })

  it('states the management-only role and the deletion rule in the system prompt', () => {
    expect(MANAGER_SYSTEM_PROMPT).toMatch(/^You are Oracle/)
    expect(MANAGER_SYSTEM_PROMPT).toMatch(/never do .*work yourself/i)
    expect(MANAGER_SYSTEM_PROMPT).toContain('close_session only asks')
    expect(MANAGER_SYSTEM_PROMPT).toContain('?computer=<computerId>&session=<sessionId>')
  })
})
